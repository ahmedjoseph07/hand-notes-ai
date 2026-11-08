'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'

import { FREE_LIMITS } from '@/lib/constants'
import { getActionUserId, getPlan } from '@/lib/auth'
import { getUserRecord, isKnownReferralCode, referralCodeFor } from '@/lib/db'
import {
  affiliateSchema,
  ONBOARDING_STEP_COUNT,
  onboardingStepSchemas,
  preferencesSchema,
} from '@/features/account/account-schema'
import type { ActionResult, VoiceMode } from '@/types'

const validationFail = (error: z.ZodError): ActionResult<never> => {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>
  return {
    ok: false,
    error: {
      code: 'VALIDATION',
      message: 'Check the highlighted fields.',
      fieldErrors: Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? 'Invalid value'])),
    },
  }
}

// ---------------------------------------------------------------------------
// Onboarding (UI_ENGINEERING.md #15): each step validates and autosaves
// ---------------------------------------------------------------------------

export async function saveOnboardingStep(step: number, values: unknown): Promise<ActionResult<{ step: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const schema = onboardingStepSchemas[step]
  if (!schema) return { ok: false, error: { code: 'VALIDATION', message: 'Unknown step.' } }
  const parsed = schema.safeParse(values)
  if (!parsed.success) return validationFail(parsed.error)

  const user = getUserRecord(session.userId)
  if ('referralCode' in parsed.data && parsed.data.referralCode) {
    const code = parsed.data.referralCode
    if (code === referralCodeFor(session.userId)) {
      return { ok: false, error: { code: 'VALIDATION', message: 'Check the code.', fieldErrors: { referralCode: "That's your own code" } } }
    }
  }
  user.onboarding = { ...user.onboarding, ...parsed.data, step: Math.max(user.onboarding.step, step + 1) }
  if ('learningStyles' in parsed.data) {
    user.preferences = { ...user.preferences, learningStyles: parsed.data.learningStyles }
  }
  return { ok: true, data: { step: user.onboarding.step } }
}

export async function completeOnboarding(): Promise<ActionResult> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const user = getUserRecord(session.userId)
  user.onboarding = { ...user.onboarding, step: ONBOARDING_STEP_COUNT, completed: true }
  refresh()
  return { ok: true, data: null }
}

/** Debounced async check while typing a referral code (UI_ENGINEERING.md #9) */
export async function checkReferralCode(code: string): Promise<{ valid: boolean; message: string }> {
  const session = await getActionUserId()
  const normalized = code.trim().toUpperCase()
  if (!/^HN[A-Z0-9]{7}$/.test(normalized)) return { valid: false, message: 'Referral codes look like HN1A2B3C4' }
  if (session.ok && normalized === referralCodeFor(session.userId)) return { valid: false, message: "That's your own code" }
  return isKnownReferralCode(normalized)
    ? { valid: true, message: 'Code applied: you both get a free Pro month after your first upgrade' }
    : { valid: false, message: 'We couldn’t find that code' }
}

// ---------------------------------------------------------------------------
// Preferences (autosaved from settings)
// ---------------------------------------------------------------------------

export async function savePreferences(values: unknown): Promise<ActionResult<{ savedAt: string }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = preferencesSchema.safeParse(values)
  if (!parsed.success) return validationFail(parsed.error)
  getUserRecord(session.userId).preferences = parsed.data
  return { ok: true, data: { savedAt: new Date().toISOString() } }
}

// ---------------------------------------------------------------------------
// Affiliate application (public form, works signed in or out)
// ---------------------------------------------------------------------------

export async function submitAffiliateApplication(values: unknown): Promise<ActionResult> {
  const parsed = affiliateSchema.safeParse(values)
  if (!parsed.success) return validationFail(parsed.error)
  const session = await getActionUserId()
  if (session.ok) {
    const { name, email, website, audience, pitch } = parsed.data
    getUserRecord(session.userId).affiliate = { name, email, website, audience, pitch, submittedAt: new Date().toISOString() }
  }
  return { ok: true, data: null }
}

// ---------------------------------------------------------------------------
// Voice usage (quota enforced on the server)
// ---------------------------------------------------------------------------

export async function canUseVoice(): Promise<ActionResult<{ remainingMinutes: number | null }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const used = Math.ceil(getUserRecord(session.userId).voiceSecondsThisMonth / 60)
  if ((await getPlan()) === 'pro') return { ok: true, data: { remainingMinutes: null } }
  const remaining = FREE_LIMITS.voiceMinutesPerMonth - used
  if (remaining <= 0) {
    return { ok: false, error: { code: 'LIMIT_REACHED', message: `You've used your ${FREE_LIMITS.voiceMinutesPerMonth} free voice minutes this month.` } }
  }
  return { ok: true, data: { remainingMinutes: remaining } }
}

export async function logVoiceSession(input: {
  mode: VoiceMode
  title: string
  href: string
  durationSec: number
}): Promise<ActionResult> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = z
    .object({
      mode: z.enum(['read', 'tutor']),
      title: z.string().min(1).max(200),
      href: z.string().regex(/^\/(notes|books)\/[\w-]+$/),
      durationSec: z.number().int().min(1).max(4 * 3600),
    })
    .safeParse(input)
  if (!parsed.success) return validationFail(parsed.error)
  const user = getUserRecord(session.userId)
  user.voiceSessions.push({ id: `vs-${crypto.randomUUID()}`, ...parsed.data, startedAt: new Date(Date.now() - parsed.data.durationSec * 1000).toISOString() })
  user.voiceSecondsThisMonth += parsed.data.durationSec
  refresh()
  return { ok: true, data: null }
}

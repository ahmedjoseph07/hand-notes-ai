import 'server-only'

import { FREE_LIMITS, PRO_LIMITS } from '@/lib/constants'
import { getUserRecord, referralCodeFor } from '@/lib/db'
import type {
  AffiliateApplication,
  AffiliateStatus,
  OnboardingProfile,
  Plan,
  ReferralSummary,
  StudyPreferences,
  UsageSummary,
  VoiceSession,
} from '@/types'

export async function getUsage(userId: string, plan: Plan): Promise<UsageSummary> {
  const user = getUserRecord(userId)
  const limits = plan === 'pro' ? PRO_LIMITS : FREE_LIMITS
  return {
    plan,
    uploads: { used: user.uploadsThisMonth, limit: limits.uploadsPerMonth },
    voiceMinutes: { used: Math.ceil(user.voiceSecondsThisMonth / 60), limit: limits.voiceMinutesPerMonth },
  }
}

export async function getOnboarding(userId: string): Promise<OnboardingProfile> {
  return getUserRecord(userId).onboarding
}

export async function getPreferences(userId: string): Promise<StudyPreferences> {
  return getUserRecord(userId).preferences
}

export async function getReferralSummary(userId: string): Promise<ReferralSummary> {
  const invites = getUserRecord(userId).referralInvites
  return {
    code: referralCodeFor(userId),
    clicks: 14 + invites.length,
    signUps: invites.filter((i) => i.status !== 'clicked').length,
    rewardsEarned: invites.filter((i) => i.status === 'subscribed').length,
    rewardsPending: invites.filter((i) => i.status === 'signed-up').length,
    invites,
  }
}

export async function getAffiliate(userId: string): Promise<{ status: AffiliateStatus; application: AffiliateApplication | null }> {
  const application = getUserRecord(userId).affiliate
  return { status: application ? 'pending' : 'none', application }
}

export async function listVoiceSessions(userId: string): Promise<VoiceSession[]> {
  return [...getUserRecord(userId).voiceSessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

import 'server-only'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

import type { ActionResult, FeatureKey, Plan } from '@/types'

/**
 * Request-time Clerk session. `connection()` first: Clerk reads the clock before the request,
 * which Cache Components would otherwise flag during prerendering.
 */
async function session() {
  await connection()
  return auth()
}

/** Signed-in user id for pages and queries; redirects to sign-in otherwise. Reads the request: call inside <Suspense>. */
export async function requireUserId(): Promise<string> {
  const { userId } = await session()
  if (!userId) redirect('/sign-in')
  return userId
}

/** Signed-in user id for Server Actions, or an UNAUTHENTICATED result to return as-is */
export async function getActionUserId(): Promise<
  { ok: true; userId: string } | { ok: false; result: ActionResult<never> }
> {
  const { userId } = await session()
  if (!userId) {
    return {
      ok: false,
      result: { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Please sign in again.' } },
    }
  }
  return { ok: true, userId }
}

/** Current Clerk Billing plan. Free until Clerk Billing plans are configured. */
export async function getPlan(): Promise<Plan> {
  const { has } = await session()
  return has({ plan: 'pro' }) ? 'pro' : 'free'
}

/** Feature gate, enforced on the server (UI_ENGINEERING.md #14) */
export async function hasFeature(feature: FeatureKey): Promise<boolean> {
  const { has } = await session()
  return has({ feature })
}

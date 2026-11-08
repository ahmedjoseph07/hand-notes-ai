/** Billing plan (Clerk Billing plan slug) */
export type Plan = 'free' | 'pro'

/** Feature keys gated by plan. Gate on features, not plan names (see UI_ENGINEERING.md #14). */
export type FeatureKey = 'export_pdf' | 'saved_views' | 'advanced_quizzes' | 'voice_tutor'

export interface UsageMeterValue {
  used: number
  /** null = unlimited */
  limit: number | null
}

export interface UsageSummary {
  plan: Plan
  uploads: UsageMeterValue
  voiceMinutes: UsageMeterValue
}

export type StudyLevel = 'high-school' | 'university' | 'professional' | 'self-learner'
export type LearningStyle = 'visual' | 'flashcards' | 'listening' | 'quizzes'

/** Study preferences captured in onboarding and edited in settings */
export interface StudyPreferences {
  dailyGoal: number
  learningStyles: readonly LearningStyle[]
  /** Read-aloud speed, 0.5–2 */
  voiceRate: number
}

export interface OnboardingProfile {
  name: string
  level: StudyLevel | null
  subjects: readonly string[]
  /** ISO date */
  examDate: string | null
  weeklyHours: number | null
  learningStyles: readonly LearningStyle[]
  source: string | null
  referralCode: string | null
  /** 0–5: last step reached, for resuming */
  step: number
  completed: boolean
}

export interface ReferralInvite {
  id: string
  email: string
  status: 'clicked' | 'signed-up' | 'subscribed'
  /** ISO date */
  date: string
}

export interface ReferralSummary {
  code: string
  clicks: number
  signUps: number
  rewardsEarned: number
  rewardsPending: number
  invites: readonly ReferralInvite[]
}

export type AffiliateStatus = 'none' | 'pending' | 'approved'

export interface AffiliateApplication {
  name: string
  email: string
  website: string
  audience: string
  pitch: string
  /** ISO date */
  submittedAt: string
}

import { z } from 'zod'

const learningStyle = z.enum(['visual', 'flashcards', 'listening', 'quizzes'])

/** One schema per onboarding step, so each step validates (and autosaves) on its own */
export const onboardingStepSchemas = [
  z.object({
    name: z.string().trim().min(1, 'Tell us what to call you').max(60, 'Keep it under 60 characters'),
    level: z.enum(['high-school', 'university', 'professional', 'self-learner'], 'Pick your study level'),
  }),
  z.object({
    subjects: z.array(z.string().trim().min(1).max(40)).min(1, 'Pick at least one subject').max(12, 'Pick up to 12 subjects'),
  }),
  z.object({
    examDate: z
      .string()
      .nullable()
      .refine((v) => v === null || v === '' || new Date(v).getTime() > Date.now() - 86_400_000, 'Pick a date from today on'),
    weeklyHours: z.number().int().min(1, 'At least 1 hour').max(80, 'That’s more than 80 hours a week').nullable(),
  }),
  z.object({
    learningStyles: z.array(learningStyle).min(1, 'Pick at least one way you like to study'),
  }),
  z.object({
    source: z.string().max(60).nullable(),
    referralCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^(HN[A-Z0-9]{7})?$/, 'Referral codes look like HN1A2B3C4')
      .nullable(),
  }),
] as const

export const ONBOARDING_STEP_COUNT = onboardingStepSchemas.length

export const preferencesSchema = z.object({
  dailyGoal: z.number().int().min(5, 'At least 5 cards').max(200, 'Up to 200 cards'),
  learningStyles: z.array(learningStyle).min(1, 'Keep at least one study style'),
  voiceRate: z.number().min(0.5).max(2),
})

export const affiliateSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.email('Enter a valid email address'),
  website: z.url('Enter a full URL, like https://youtube.com/@you'),
  audience: z.enum(['<1k', '1k-10k', '10k-100k', '100k+'], 'Pick your audience size'),
  pitch: z.string().trim().min(30, 'Tell us a bit more (at least 30 characters)').max(1000),
  terms: z.literal(true, 'Please accept the program terms'),
})

export type AffiliateInput = z.infer<typeof affiliateSchema>

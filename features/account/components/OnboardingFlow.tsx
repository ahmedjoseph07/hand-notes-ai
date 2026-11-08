'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { ArrowLeft, Camera, Check, LoaderCircle, Plus, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/controls'
import { Field, fieldA11y, Input, Select } from '@/components/ui/field'
import { checkReferralCode, completeOnboarding, saveOnboardingStep } from '@/features/account/account-actions'
import { ONBOARDING_STEP_COUNT, onboardingStepSchemas } from '@/features/account/account-schema'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ATTRIBUTION_SOURCES, LEARNING_STYLES, STUDY_LEVELS, SUBJECT_SUGGESTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { OnboardingProfile } from '@/types'

const STEP_TITLES = [
  { title: 'Let’s set up your study space', why: 'So we can greet you and pitch explanations at the right level.' },
  { title: 'What are you studying?', why: 'Subjects become filters and colors for your notes.' },
  { title: 'Any exams coming up?', why: 'We’ll pace your flashcard reviews so you’re ready on the day.' },
  { title: 'How do you like to study?', why: 'We’ll generate these study tools first for every page you upload.' },
  { title: 'Last thing', why: 'Helps us understand what’s working. Totally optional.' },
] as const

type FieldErrors = Record<string, string | undefined>

export function OnboardingFlow({ profile, cookieReferral }: { profile: OnboardingProfile; cookieReferral: string | null }) {
  const router = useRouter()
  const [step, setStep] = useState(Math.min(profile.step, ONBOARDING_STEP_COUNT))
  const [values, setValues] = useState({
    name: profile.name,
    level: profile.level,
    subjects: [...profile.subjects],
    examDate: profile.examDate,
    weeklyHours: profile.weeklyHours,
    learningStyles: [...profile.learningStyles],
    source: profile.source,
    referralCode: profile.referralCode ?? cookieReferral,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [customSubject, setCustomSubject] = useState('')
  const [pending, startTransition] = useTransition()
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Async referral check, debounced (UI_ENGINEERING.md #7, #9)
  const debouncedCode = useDebouncedValue(values.referralCode ?? '', 400)
  const [codeCheck, setCodeCheck] = useState<{ code: string; valid: boolean; message: string } | null>(null)
  useEffect(() => {
    const code = debouncedCode.trim()
    if (code.length < 9) return
    let cancelled = false
    void checkReferralCode(code).then((r) => {
      if (!cancelled) setCodeCheck({ code, ...r })
    })
    return () => {
      cancelled = true
    }
  }, [debouncedCode])
  const codeStatus = values.referralCode && codeCheck?.code === values.referralCode.trim().toUpperCase() ? codeCheck : null

  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  const stepValues = (): unknown => {
    switch (step) {
      case 0:
        return { name: values.name, level: values.level }
      case 1:
        return { subjects: values.subjects }
      case 2:
        return { examDate: values.examDate || null, weeklyHours: values.weeklyHours }
      case 3:
        return { learningStyles: values.learningStyles }
      default:
        return { source: values.source, referralCode: values.referralCode?.trim() || null }
    }
  }

  const next = () => {
    const schema: z.ZodType | undefined = onboardingStepSchemas[step]
    if (!schema) return
    const parsed = schema.safeParse(stepValues())
    if (!parsed.success) {
      const flat = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])))
      return
    }
    setErrors({})
    startTransition(async () => {
      const result = await saveOnboardingStep(step, stepValues())
      if (result.ok) setStep((s) => s + 1)
      else if (result.error.fieldErrors) setErrors(result.error.fieldErrors)
      else toast.error(result.error.message)
    })
  }

  const finish = (href: string) =>
    startTransition(async () => {
      const result = await completeOnboarding()
      if (result.ok) router.push(href)
      else toast.error(result.error.message)
    })

  const toggleSubject = (subject: string) =>
    setValues((v) => ({ ...v, subjects: v.subjects.includes(subject) ? v.subjects.filter((s) => s !== subject) : [...v.subjects, subject] }))

  const addCustomSubject = () => {
    const subject = customSubject.trim()
    if (subject && !values.subjects.includes(subject)) setValues((v) => ({ ...v, subjects: [...v.subjects, subject] }))
    setCustomSubject('')
  }

  if (step >= ONBOARDING_STEP_COUNT) {
    return (
      <div className='space-y-6 pt-6 text-center'>
        <Sparkles className='mx-auto size-10 text-[var(--warning)]' aria-hidden />
        <h1 ref={headingRef} tabIndex={-1} className='font-serif text-3xl font-semibold outline-none sm:text-4xl'>
          You’re all set{values.name ? `, ${values.name}` : ''}!
        </h1>
        <p className='text-lg text-[var(--text-secondary)]'>Get your first win: upload a page and watch it turn into flashcards.</p>
        <div className='mx-auto flex max-w-md flex-col gap-3'>
          <button type='button' disabled={pending} onClick={() => finish('/notes/new?source=photo')} className='btn-primary cursor-pointer'>
            <Camera className='mr-2 size-5' aria-hidden /> Upload your first page
          </button>
          <button type='button' disabled={pending} onClick={() => finish('/library')} className='btn-secondary cursor-pointer border border-[var(--border-medium)]'>
            Explore the sample notes first
          </button>
        </div>
      </div>
    )
  }

  const meta = STEP_TITLES[step] ?? STEP_TITLES[0]

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        next()
      }}
      className='space-y-8'
    >
      <div className='space-y-3'>
        <p className='text-sm font-semibold text-[var(--color-brand)]'>
          Step {step + 1} of {ONBOARDING_STEP_COUNT}
        </p>
        <div className='flex gap-1.5' aria-hidden>
          {Array.from({ length: ONBOARDING_STEP_COUNT }, (_, i) => (
            <span key={i} className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-[var(--color-brand)]' : 'bg-[var(--bg-secondary)]')} />
          ))}
        </div>
        <h1 ref={headingRef} tabIndex={-1} className='pt-2 font-serif text-3xl font-semibold outline-none sm:text-4xl'>
          {meta.title}
        </h1>
        <p className='text-[var(--text-secondary)]'>{meta.why}</p>
      </div>

      {step === 0 && (
        <div className='space-y-6'>
          <Field id='ob-name' label='What should we call you?' error={errors.name}>
            <Input {...fieldA11y('ob-name', errors.name)} autoComplete='given-name' value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
          </Field>
          <fieldset aria-describedby={errors.level ? 'ob-level-error' : undefined}>
            <legend className='mb-2 text-sm font-semibold'>Where are you studying?</legend>
            <div className='grid gap-3 sm:grid-cols-2'>
              {STUDY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={cn(
                    'flex h-14 cursor-pointer items-center gap-3 rounded-[12px] border-2 bg-white px-4 font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-[var(--text-primary)]/20',
                    values.level === level.value ? 'border-[var(--color-brand)] bg-[var(--accent-light)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]',
                  )}
                >
                  <input type='radio' name='level' value={level.value} checked={values.level === level.value} onChange={() => setValues((v) => ({ ...v, level: level.value }))} className='accent-[var(--color-brand)]' />
                  {level.label}
                </label>
              ))}
            </div>
            {errors.level && (
              <p id='ob-level-error' role='alert' className='mt-2 text-sm text-[var(--destructive)]'>
                {errors.level}
              </p>
            )}
          </fieldset>
        </div>
      )}

      {step === 1 && (
        <div className='space-y-4'>
          <div role='group' aria-label='Subjects' className='flex flex-wrap gap-2'>
            {[...new Set([...SUBJECT_SUGGESTIONS, ...values.subjects])].map((subject) => {
              const on = values.subjects.includes(subject)
              return (
                <button
                  key={subject}
                  type='button'
                  aria-pressed={on}
                  onClick={() => toggleSubject(subject)}
                  className={cn(
                    'inline-flex h-11 items-center gap-1.5 rounded-full border-2 px-4 font-medium transition-colors',
                    on ? 'border-[var(--color-brand)] bg-[var(--accent-light)] text-[var(--color-brand)]' : 'border-[var(--border-subtle)] bg-white hover:border-[var(--border-medium)]',
                  )}
                >
                  {on && <Check className='size-4' aria-hidden />} {subject}
                </button>
              )
            })}
          </div>
          <div className='flex gap-2'>
            <label htmlFor='ob-custom' className='sr-only'>
              Add another subject
            </label>
            <Input
              id='ob-custom'
              placeholder='Add another subject'
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomSubject()
                }
              }}
            />
            <Button type='button' variant='outline' size='lg' className='h-11 px-4' onClick={addCustomSubject}>
              <Plus aria-hidden /> Add
            </Button>
          </div>
          {errors.subjects && (
            <p role='alert' className='text-sm text-[var(--destructive)]'>
              {errors.subjects}
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field id='ob-exam' label='Next exam date' optional error={errors.examDate}>
            <Input {...fieldA11y('ob-exam', errors.examDate)} type='date' value={values.examDate ?? ''} onChange={(e) => setValues((v) => ({ ...v, examDate: e.target.value || null }))} />
          </Field>
          <Field id='ob-hours' label='Hours you can study per week' optional error={errors.weeklyHours}>
            <Input
              {...fieldA11y('ob-hours', errors.weeklyHours)}
              type='number'
              inputMode='numeric'
              min={1}
              max={80}
              value={values.weeklyHours ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, weeklyHours: e.target.value ? Number(e.target.value) : null }))}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <fieldset>
          <legend className='sr-only'>Study styles</legend>
          <div className='grid gap-3 sm:grid-cols-2'>
            {LEARNING_STYLES.map((style) => (
              <label key={style.value} className='flex cursor-pointer items-start gap-3 rounded-[12px] border-2 border-[var(--border-subtle)] bg-white p-4 has-data-checked:border-[var(--color-brand)] has-data-checked:bg-[var(--accent-light)]'>
                <Checkbox
                  checked={values.learningStyles.includes(style.value)}
                  onCheckedChange={(on) =>
                    setValues((v) => ({ ...v, learningStyles: on ? [...v.learningStyles, style.value] : v.learningStyles.filter((s) => s !== style.value) }))
                  }
                />
                <span>
                  <span className='block font-semibold'>{style.label}</span>
                  <span className='text-sm text-[var(--text-secondary)]'>{style.description}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.learningStyles && (
            <p role='alert' className='mt-2 text-sm text-[var(--destructive)]'>
              {errors.learningStyles}
            </p>
          )}
        </fieldset>
      )}

      {step === 4 && (
        <div className='space-y-5'>
          <Field id='ob-source' label='How did you hear about us?' optional>
            <Select id='ob-source' value={values.source ?? ''} onChange={(e) => setValues((v) => ({ ...v, source: e.target.value || null }))}>
              <option value=''>Choose…</option>
              {ATTRIBUTION_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field id='ob-ref' label='Referral code' optional error={errors.referralCode ?? (codeStatus && !codeStatus.valid ? codeStatus.message : undefined)} hint={codeStatus?.valid ? codeStatus.message : 'From a friend’s invite link'}>
            <Input
              {...fieldA11y('ob-ref', errors.referralCode, 'From a friend’s invite link')}
              autoCapitalize='characters'
              placeholder='HN1A2B3C4'
              value={values.referralCode ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, referralCode: e.target.value.toUpperCase() || null }))}
              className='font-mono uppercase'
            />
          </Field>
          <p className='text-sm text-[var(--text-secondary)]'>We’ll never email you marketing without asking first.</p>
        </div>
      )}

      <div className='flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-6'>
        {step > 0 ? (
          <Button type='button' variant='ghost' size='lg' className='h-11 px-3' onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft aria-hidden /> Back
          </Button>
        ) : (
          <span />
        )}
        <div className='flex items-center gap-2'>
          {step > 0 && (
            <Button type='button' variant='ghost' size='lg' className='h-11 px-3 text-[var(--text-secondary)]' onClick={() => setStep((s) => s + 1)}>
              Skip
            </Button>
          )}
          <button type='submit' disabled={pending} aria-busy={pending} className='btn-primary cursor-pointer'>
            {pending && <LoaderCircle className='mr-2 size-5 animate-spin' aria-hidden />}
            {step === ONBOARDING_STEP_COUNT - 1 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </form>
  )
}

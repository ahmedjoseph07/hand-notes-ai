'use client'

import { useRef, useState, useTransition } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { z } from 'zod'

import { Checkbox } from '@/components/ui/controls'
import { Field, fieldA11y, Input, Select, Textarea } from '@/components/ui/field'
import { submitAffiliateApplication } from '@/features/account/account-actions'
import { affiliateSchema, type AffiliateInput } from '@/features/account/account-schema'

type Values = Omit<AffiliateInput, 'terms' | 'audience'> & { terms: boolean; audience: AffiliateInput['audience'] | '' }
type Errors = Partial<Record<keyof Values, string>>

const EMPTY: Values = { name: '', email: '', website: '', audience: '', pitch: '', terms: false }

const validate = (values: Values): Errors => {
  const result = affiliateSchema.safeParse(values)
  if (result.success) return {}
  const flat = z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>
  return Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])) as Errors
}

/**
 * Smart validation (UI_ENGINEERING.md #9): a field is checked on blur, then on every change
 * once it has shown an error; everything is checked on submit and the server re-validates.
 */
export function AffiliateForm() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value }
    setValues(next)
    if (touched[key] || errors[key]) setErrors((e) => ({ ...e, [key]: validate(next)[key] }))
  }
  const blur = (key: keyof Values) => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors((e) => ({ ...e, [key]: validate(values)[key] }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched({ name: true, email: true, website: true, audience: true, pitch: true, terms: true })
    const firstInvalid = (Object.keys(found) as (keyof Values)[])[0]
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#aff-${firstInvalid}`)?.focus()
      return
    }
    startTransition(async () => {
      const result = await submitAffiliateApplication(values)
      if (result.ok) {
        setDone(true)
        setFormError(null)
      } else {
        setErrors((result.error.fieldErrors ?? {}) as Errors)
        setFormError(result.error.message)
      }
    })
  }

  if (done) {
    return (
      <div role='status' className='flex flex-col items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-white p-10 text-center'>
        <CheckCircle2 className='size-10 text-[var(--success)]' aria-hidden />
        <h3 className='font-serif text-2xl font-semibold'>Application received</h3>
        <p className='max-w-md text-[var(--text-secondary)]'>
          Thanks, {values.name.split(' ')[0]}! We review applications within a few days and will email {values.email}.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} noValidate onSubmit={submit} className='space-y-5 rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-soft-sm sm:p-8'>
      {formError && (
        <p role='alert' className='rounded-[10px] bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]'>
          {formError}
        </p>
      )}
      <div className='grid gap-5 sm:grid-cols-2'>
        <Field id='aff-name' label='Full name' error={errors.name}>
          <Input {...fieldA11y('aff-name', errors.name)} autoComplete='name' value={values.name} onChange={(e) => update('name', e.target.value)} onBlur={() => blur('name')} />
        </Field>
        <Field id='aff-email' label='Email' error={errors.email}>
          <Input
            {...fieldA11y('aff-email', errors.email)}
            type='email'
            autoComplete='email'
            inputMode='email'
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            onBlur={() => blur('email')}
          />
        </Field>
      </div>
      <Field id='aff-website' label='Where you create' hint='Your channel, blog or profile' error={errors.website}>
        <Input
          {...fieldA11y('aff-website', errors.website, 'Your channel, blog or profile')}
          type='url'
          inputMode='url'
          placeholder='https://youtube.com/@you'
          value={values.website}
          onChange={(e) => update('website', e.target.value)}
          onBlur={() => blur('website')}
        />
      </Field>
      <Field id='aff-audience' label='Audience size' error={errors.audience}>
        <Select
          {...fieldA11y('aff-audience', errors.audience)}
          value={values.audience}
          onChange={(e) => update('audience', e.target.value as Values['audience'])}
          onBlur={() => blur('audience')}
        >
          <option value=''>Choose…</option>
          <option value='<1k'>Under 1,000</option>
          <option value='1k-10k'>1,000–10,000</option>
          <option value='10k-100k'>10,000–100,000</option>
          <option value='100k+'>100,000+</option>
        </Select>
      </Field>
      <Field id='aff-pitch' label='How would you share HandNotesAI?' hint='A sentence or two about your audience' error={errors.pitch}>
        <Textarea
          {...fieldA11y('aff-pitch', errors.pitch, 'A sentence or two about your audience')}
          value={values.pitch}
          onChange={(e) => update('pitch', e.target.value)}
          onBlur={() => blur('pitch')}
        />
      </Field>
      <div className='space-y-1.5'>
        <label className='flex items-start gap-3 text-sm'>
          <Checkbox
            id='aff-terms'
            checked={values.terms}
            onCheckedChange={(checked) => update('terms', checked)}
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? 'aff-terms-error' : undefined}
          />
          <span>I agree to the affiliate program terms and will disclose that links are affiliate links.</span>
        </label>
        {errors.terms && (
          <p id='aff-terms-error' role='alert' className='text-sm text-[var(--destructive)]'>
            {errors.terms}
          </p>
        )}
      </div>
      <button type='submit' disabled={pending} aria-busy={pending} className='btn-primary w-full cursor-pointer sm:w-auto'>
        {pending && <LoaderCircle className='mr-2 size-5 animate-spin' aria-hidden />}
        {pending ? 'Sending…' : 'Apply to the program'}
      </button>
    </form>
  )
}

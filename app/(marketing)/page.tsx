import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  Camera,
  GraduationCap,
  Highlighter,
  ScanText,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

import { PricingCards } from '@/components/marketing/PricingCards'
import { HERO_STEPS, LANDING_FEATURES } from '@/lib/constants'

const FEATURE_ICONS: readonly LucideIcon[] = [ScanText, Highlighter, GraduationCap, AudioLines, BookOpen, Smartphone]

export default function LandingPage() {
  return (
    <main id='main'>
      {/* Hero */}
      <section className='wrapper grid items-center gap-12 pt-[calc(var(--navbar-height)+48px)] pb-16 lg:grid-cols-[1.05fr_1fr] lg:pt-[calc(var(--navbar-height)+72px)]'>
        <div className='flex flex-col items-start gap-6'>
          <p className='inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)]'>
            <Camera className='size-4 text-[var(--color-brand)]' aria-hidden />
            Snap a page. Study it in minutes.
          </p>
          <h1 className='page-title-xl text-balance'>Your handwritten notes, turned into a study space.</h1>
          <p className='max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]'>
            Upload photos of your notes and get clean text, visual summaries, flashcards and quizzes, plus notes read aloud when
            you&apos;re on the go. Everything you study, in one calm place.
          </p>
          <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
            <Link href='/sign-up' className='btn-primary'>
              Start studying free
            </Link>
            <Link href='#how' className='btn-secondary border border-[var(--border-medium)]'>
              See how it works
            </Link>
          </div>
          <p className='text-sm text-[var(--text-secondary)]'>Free plan · no credit card · works on your phone</p>
        </div>
        <div className='rounded-[28px] bg-[var(--bg-secondary)] p-4 sm:p-8'>
          <Image src='/hero-notes.svg' alt='A handwritten page turning into typed notes, flashcards and an AI chat' width={560} height={440} preload className='h-auto w-full' />
        </div>
      </section>

      {/* How it works */}
      <section id='how' aria-labelledby='how-title' className='scroll-mt-28 bg-white/60 py-20'>
        <div className='wrapper'>
          <div className='mx-auto mb-12 max-w-2xl text-center'>
            <p className='mb-2 text-sm font-semibold tracking-wide text-[var(--color-brand)] uppercase'>How it works</p>
            <h2 id='how-title' className='section-title'>
              From paper to practice in three steps
            </h2>
          </div>
          <ol className='grid gap-6 md:grid-cols-3'>
            {HERO_STEPS.map((step, i) => (
              <li key={step.title} className='rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6'>
                <span className='library-step-number mb-4'>{i + 1}</span>
                <h3 className='font-serif text-xl font-semibold'>{step.title}</h3>
                <p className='mt-1.5 text-[var(--text-secondary)]'>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id='features' aria-labelledby='features-title' className='wrapper scroll-mt-28 py-20'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <p className='mb-2 text-sm font-semibold tracking-wide text-[var(--color-brand)] uppercase'>Features</p>
          <h2 id='features-title' className='section-title'>
            Everything you need to actually remember it
          </h2>
        </div>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {LANDING_FEATURES.map((feature, i) => {
            const Icon = FEATURE_ICONS[i] ?? ScanText
            return (
              <article key={feature.title} className='rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-soft-sm'>
                <span className='mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--color-brand)]'>
                  <Icon className='size-5' aria-hidden />
                </span>
                <h3 className='font-serif text-xl font-semibold'>{feature.title}</h3>
                <p className='mt-1.5 text-[15px] leading-relaxed text-[var(--text-secondary)]'>{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* Study desk */}
      <section aria-labelledby='desk-title' className='wrapper'>
        <div className='library-hero-card'>
          <div className='grid w-full items-center gap-8 lg:grid-cols-2'>
            <Image src='/hero-desk.svg' alt='' width={356} height={226} className='mx-auto h-auto w-full max-w-md' />
            <div className='space-y-4 text-center lg:text-left'>
              <h2 id='desk-title' className='library-hero-title'>
                Your notes and your books, side by side
              </h2>
              <p className='library-hero-description'>
                Keep the textbooks and classics you study from next to your own notes. Track reading progress, then have a summary read aloud.
              </p>
              <Link href='/sign-up' className='library-cta-primary'>
                Build your library <ArrowRight className='size-5' aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section aria-labelledby='pricing-title' className='wrapper py-20'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <p className='mb-2 text-sm font-semibold tracking-wide text-[var(--color-brand)] uppercase'>Pricing</p>
          <h2 id='pricing-title' className='section-title'>
            Start free. Upgrade for exam season.
          </h2>
        </div>
        <PricingCards />
      </section>

      {/* Final CTA */}
      <section className='wrapper'>
        <div className='rounded-[28px] bg-[var(--text-primary)] px-6 py-14 text-center text-white sm:px-12'>
          <h2 className='font-serif text-3xl font-semibold sm:text-4xl'>Your next exam starts with the notes you already have.</h2>
          <p className='mx-auto mt-3 max-w-xl text-white/75'>Snap your first page in under a minute.</p>
          <Link href='/sign-up' className='btn-primary mt-8'>
            Start studying free
          </Link>
        </div>
      </section>
    </main>
  )
}

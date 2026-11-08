import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'

import { HERO_STEPS } from '@/lib/constants'
import type { ImageAsset } from '@/types'

const ILLUSTRATION = {
  src: '/hero-desk.svg',
  width: 356,
  height: 226,
} as const satisfies ImageAsset

const HeroSection = () => {
  return (
    <section aria-labelledby='hero-title' className='library-hero-card'>
      <div className='library-hero-content'>
        {/* Left: heading, description, CTAs */}
        <div className='library-hero-text'>
          <h1 id='hero-title' className='library-hero-title'>
            Your Study Space
          </h1>
          <p className='library-hero-description'>
            Turn handwritten notes into visual study pages.
            <br className='hidden md:block' /> Plus a book library for everything you read.
          </p>
          <div className='flex w-full flex-col items-center gap-3 lg:flex-row lg:gap-5'>
            <Link href='/notes/new' className='library-cta-primary'>
              <Plus className='size-5' strokeWidth={2.5} aria-hidden />
              Add new note
            </Link>
            <Link
              href='#books'
              className='inline-flex items-center gap-1.5 text-base font-medium text-[var(--text-primary)] underline-offset-4 hover:text-[var(--color-brand)] hover:underline'
            >
              Browse books
              <ArrowRight className='size-4' aria-hidden />
            </Link>
          </div>
        </div>

        {/* Center: illustration (mobile/tablet + desktop variants) */}
        <div className='library-hero-illustration'>
          <Image {...ILLUSTRATION} alt='' className='h-auto w-[280px] sm:w-[320px]' />
        </div>
        <div className='library-hero-illustration-desktop'>
          <Image {...ILLUSTRATION} alt='' preload className='h-auto w-full max-w-[400px]' />
        </div>

        {/* Right: how notes work */}
        <ol
          aria-label='How it works'
          className='library-steps-card flex w-full max-w-sm flex-col gap-4 text-left lg:w-[236px] lg:shrink-0'
        >
          {HERO_STEPS.map(({ title, description }, i) => (
            <li key={title} className='library-step-item'>
              <span className='library-step-number' aria-hidden>
                {i + 1}
              </span>
              <div>
                <p className='library-step-title'>{title}</p>
                <p className='library-step-description'>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HeroSection

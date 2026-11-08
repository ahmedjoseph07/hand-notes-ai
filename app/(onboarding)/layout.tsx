import Image from 'next/image'
import Link from 'next/link'

/** Focused, distraction-free frame for first-run onboarding (UI_ENGINEERING.md #15) */
export default function OnboardingLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className='flex min-h-dvh flex-col'>
      <header className='flex h-16 items-center justify-between px-5 sm:px-8'>
        <Link href='/' className='flex items-center gap-2.5' aria-label='HandNotesAI home'>
          <Image src='/logo-mark.svg' alt='' width={32} height={32} className='size-8' />
          <span className='font-serif text-lg font-semibold'>
            HandNotes<span className='text-brand'>AI</span>
          </span>
        </Link>
        <Link href='/library' className='text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline'>
          Skip for now
        </Link>
      </header>
      <main className='mx-auto w-full max-w-2xl flex-1 px-5 pt-4 pb-16 sm:px-8'>{children}</main>
    </div>
  )
}

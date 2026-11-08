import Image from 'next/image'
import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Sign in', href: '/sign-in' },
    ],
  },
  {
    title: 'Programs',
    links: [
      { label: 'Affiliates', href: '/affiliates' },
      { label: 'Refer a friend', href: '/referrals' },
    ],
  },
] as const

export function MarketingFooter() {
  return (
    <footer className='mt-24 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/60'>
      <div className='wrapper grid gap-10 py-12 sm:grid-cols-[1.5fr_1fr_1fr]'>
        <div className='space-y-3'>
          <Link href='/' className='flex items-center gap-2.5'>
            <Image src='/logo-mark.svg' alt='' width={36} height={36} className='size-9' />
            <span className='font-serif text-lg font-semibold'>
              HandNotes<span className='text-brand'>AI</span>
            </span>
          </Link>
          <p className='max-w-xs text-sm text-[var(--text-secondary)]'>
            Your handwritten notes, turned into a study space: clean text, summaries, flashcards and quizzes.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className='mb-3 text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase'>{col.title}</h2>
            <ul className='space-y-2'>
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className='text-sm text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  )
}

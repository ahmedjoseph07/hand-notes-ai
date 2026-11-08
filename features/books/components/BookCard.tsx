import Image from 'next/image'
import Link from 'next/link'

import type { BookCardProps } from '@/types'

const BookCard = ({ book, progress }: BookCardProps) => {
  const { slug, title, author, coverURL } = book

  return (
    <Link
      href={`/books/${slug}`}
      className='book-card rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]'
    >
      <div className='book-card-cover-wrapper'>
        <Image
          src={coverURL}
          alt={`Cover of ${title}`}
          width={133}
          height={200}
          sizes='(min-width: 768px) 133px, 113px'
          style={{ width: 'auto' }}
          className='book-card-cover'
        />
      </div>
      <div className='book-card-meta'>
        <h3 className='book-card-title'>{title}</h3>
        <p className='book-card-author'>{author}</p>
        {progress !== undefined && progress > 0 && (
          <div className='mt-2 flex items-center gap-2'>
            <div
              role='progressbar'
              aria-label={`Reading progress: ${progress}%`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className='h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-secondary)]'
            >
              <div className='h-full rounded-full bg-[var(--color-brand)]' style={{ width: `${progress}%` }} />
            </div>
            <span className='text-xs text-[var(--text-secondary)] tabular-nums'>{progress}%</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default BookCard

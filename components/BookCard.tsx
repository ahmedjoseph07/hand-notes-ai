import Image from 'next/image'
import Link from 'next/link'

import type { BookCardProps } from '@/types'

const BookCard = ({ book }: BookCardProps) => {
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
          className='book-card-cover'
        />
      </div>
      <div className='book-card-meta'>
        <h3 className='book-card-title'>{title}</h3>
        <p className='book-card-author'>{author}</p>
      </div>
    </Link>
  )
}

export default BookCard

import { NotFoundView } from '@/components/feedback/NotFoundView'

export default function BookNotFound() {
  return (
    <NotFoundView
      title='That book isn’t in the library'
      description='The link may be old. Browse the library or search with ⌘K.'
      links={[
        { label: 'Browse books', href: '/books' },
        { label: 'Go to Library', href: '/library' },
      ]}
    />
  )
}

import { NotFoundView } from '@/components/feedback/NotFoundView'

/** 404 inside the app shell (sidebar stays visible) */
export default function AppNotFound() {
  return (
    <NotFoundView
      title='We couldn’t find that'
      description='It may have been moved or deleted, or the link is mistyped. Press ⌘K to search everything.'
      links={[
        { label: 'Go to Library', href: '/library' },
        { label: 'All notes', href: '/notes' },
      ]}
    />
  )
}

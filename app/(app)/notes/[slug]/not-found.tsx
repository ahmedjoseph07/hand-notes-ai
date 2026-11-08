import { NotFoundView } from '@/components/feedback/NotFoundView'

export default function NoteNotFound() {
  return (
    <NotFoundView
      title='This note doesn’t exist or was deleted'
      description='If you deleted it recently, it’s waiting in Trash for 30 days.'
      links={[
        { label: 'Check Trash', href: '/notes/trash' },
        { label: 'All notes', href: '/notes' },
      ]}
    />
  )
}

'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Headphones, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { startReading, stopReading } from '@/features/voice/speech'
import { useVoiceStore } from '@/stores/voice-store'
import type { VoiceSource } from '@/types'

/** Starts read-aloud for a note or book; the mini player takes over from there */
export function ReadAloudButton({ source, label = 'Listen' }: { source: VoiceSource; label?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const current = useVoiceStore((s) => s.source)
  const status = useVoiceStore((s) => s.status)
  const isThis = current?.slug === source.slug && status !== 'idle' && status !== 'ended'

  return (
    <Button
      variant='outline'
      size='lg'
      className='h-10 px-3.5'
      aria-busy={pending}
      onClick={() => (isThis ? stopReading() : startTransition(() => startReading(source, () => router.push('/pricing'))))}
    >
      {pending ? <LoaderCircle className='animate-spin' aria-hidden /> : <Headphones aria-hidden />}
      {isThis ? 'Stop listening' : label}
    </Button>
  )
}

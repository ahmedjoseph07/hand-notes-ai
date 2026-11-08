'use client'

import { useState, useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

const noopSubscribe = () => () => {}

/** Personal invite link with copy + native share (UI_ENGINEERING.md #16) */
export function ReferralLinkCard({ code }: { code: string }) {
  // Origin only exists in the browser; the server renders the path alone (no hydration mismatch)
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => '')
  const canShare = useSyncExternalStore(noopSubscribe, () => typeof navigator.share === 'function', () => false)
  const [copied, setCopied] = useState(false)
  const link = `${origin}/?ref=${code}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Invite link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Couldn’t copy. Select the link and copy it manually.')
    }
  }

  const share = async () => {
    try {
      await navigator.share({ title: 'Study with HandNotesAI', text: 'Turn your handwritten notes into flashcards and quizzes. Here’s a free Pro month:', url: link })
    } catch {
      // Share sheet dismissed: nothing to do
    }
  }

  return (
    <div className='space-y-3'>
      <label htmlFor='referral-link' className='text-sm font-semibold'>
        Your invite link
      </label>
      <div className='flex flex-col gap-2 sm:flex-row'>
        <input
          id='referral-link'
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className='h-11 flex-1 rounded-[10px] border border-[var(--border-medium)] bg-[var(--bg-tertiary)] px-3.5 font-mono text-sm outline-none focus-visible:border-[var(--text-primary)]'
        />
        <div className='flex gap-2'>
          <Button variant='brand' size='lg' className='h-11 flex-1 px-4' onClick={() => void copy()}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />} {copied ? 'Copied' : 'Copy link'}
          </Button>
          {canShare && (
            <Button variant='outline' size='lg' className='h-11 flex-1 px-4' onClick={() => void share()}>
              <Share2 aria-hidden /> Share
            </Button>
          )}
        </div>
      </div>
      <p className='text-sm text-[var(--text-secondary)]'>
        Or share your code: <span className='font-mono font-semibold text-[var(--text-primary)]'>{code}</span>
      </p>
    </div>
  )
}

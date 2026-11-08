'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createColumnHelper } from '@tanstack/react-table'
import { BookOpen, Headphones, MessageCircle, NotebookPen } from 'lucide-react'

import { DataTable } from '@/components/data-table/DataTable'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { Badge } from '@/components/ui/controls'
import { Select } from '@/components/ui/field'
import { LockedFeature } from '@/features/billing/components/PlanBadge'
import { UsageMeter } from '@/features/billing/components/UsageMeter'
import { ReadAloudButton } from '@/features/voice/components/ReadAloudButton'
import { formatDate, formatDuration } from '@/lib/format'
import type { DataTableFeatures, VoiceSession, VoiceStudioProps } from '@/types'

const helper = createColumnHelper<DataTableFeatures, VoiceSession>()
const sessionColumns = helper.columns([
  helper.accessor('title', {
    header: 'Listened to',
    sortFn: 'text',
    cell: ({ row }) => (
      <Link href={row.original.href} className='font-medium hover:text-[var(--color-brand)] hover:underline'>
        {row.original.title}
      </Link>
    ),
  }),
  helper.accessor('mode', {
    header: 'Mode',
    cell: ({ getValue }) => <Badge>{getValue() === 'read' ? 'Read aloud' : 'Voice tutor'}</Badge>,
  }),
  helper.accessor('startedAt', { header: 'Date', sortFn: 'text', cell: ({ getValue }) => formatDate(getValue()) }),
  helper.accessor('durationSec', { header: 'Duration', cell: ({ getValue }) => <span className='tabular-nums'>{formatDuration(getValue())}</span> }),
])

export function VoiceStudio({ sources, initialKey, sessions, voiceMinutes, plan }: VoiceStudioProps) {
  const [key, setKey] = useState(initialKey ?? (sources[0] ? `${sources[0].kind}:${sources[0].slug}` : ''))
  const source = sources.find((s) => `${s.kind}:${s.slug}` === key)

  return (
    <div className='space-y-10'>
      <div className='grid gap-5 lg:grid-cols-[1.4fr_1fr]'>
        {/* Read aloud */}
        <section aria-labelledby='read-title' className='space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-soft-sm'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex size-11 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--color-brand)]'>
              <Headphones className='size-5' aria-hidden />
            </span>
            <div>
              <h2 id='read-title' className='font-serif text-xl font-semibold'>
                Read aloud
              </h2>
              <p className='text-sm text-[var(--text-secondary)]'>Listen to a note or book summary. Keeps playing while you browse.</p>
            </div>
          </div>
          {sources.length === 0 ? (
            <EmptyState size='compact' title='Nothing to read yet' description='Upload a note and it can be read aloud as soon as it’s transcribed.' action={{ label: 'Upload a note', href: '/notes/new' }} />
          ) : (
            <>
              <label htmlFor='voice-source' className='block text-sm font-semibold'>
                What should we read?
              </label>
              <Select id='voice-source' value={key} onChange={(e) => setKey(e.target.value)}>
                <optgroup label='Your notes'>
                  {sources
                    .filter((s) => s.kind === 'note')
                    .map((s) => (
                      <option key={s.slug} value={`note:${s.slug}`}>
                        {s.title}
                      </option>
                    ))}
                </optgroup>
                <optgroup label='Books'>
                  {sources
                    .filter((s) => s.kind === 'book')
                    .map((s) => (
                      <option key={s.slug} value={`book:${s.slug}`}>
                        {s.title}
                      </option>
                    ))}
                </optgroup>
              </Select>
              {source && (
                <div className='flex flex-wrap items-center gap-3 rounded-[12px] bg-[var(--bg-tertiary)] p-4'>
                  {source.kind === 'note' ? <NotebookPen className='size-5 text-[var(--color-brand)]' aria-hidden /> : <BookOpen className='size-5 text-[var(--color-brand)]' aria-hidden />}
                  <p className='min-w-0 flex-1 truncate font-medium'>{source.title}</p>
                  <ErrorBoundary name='Read aloud'>
                    <ReadAloudButton source={source} label='Start listening' />
                  </ErrorBoundary>
                </div>
              )}
              <p className='text-xs text-[var(--text-secondary)]'>Uses your device’s voice. Press Space to pause or resume.</p>
            </>
          )}
        </section>

        {/* Voice tutor (Vapi) */}
        <section aria-labelledby='tutor-title' className='flex flex-col gap-4 rounded-2xl bg-[var(--bg-secondary)] p-6'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex size-11 items-center justify-center rounded-xl bg-white text-[var(--color-brand)]'>
              <MessageCircle className='size-5' aria-hidden />
            </span>
            <div>
              <h2 id='tutor-title' className='font-serif text-xl font-semibold'>
                Voice tutor
              </h2>
              <p className='text-sm text-[var(--text-secondary)]'>Talk through a note, or get quizzed out loud.</p>
            </div>
          </div>
          <ul className='space-y-1.5 text-[15px] text-[var(--text-secondary)]'>
            <li>• “Quiz me on cell organelles”</li>
            <li>• “Explain Newton’s third law simply”</li>
            <li>• “What were the causes of the French Revolution?”</li>
          </ul>
          <div className='mt-auto space-y-3'>
            <UsageMeter label='Voice minutes' unit='minutes this month' value={voiceMinutes} />
            {plan === 'free' ? (
              <LockedFeature label='Start voice tutor' benefit='Have spoken study sessions with an AI tutor' />
            ) : (
              <p className='rounded-[10px] bg-white px-3 py-2 text-sm text-[var(--text-secondary)]'>The voice tutor is being set up for your account. Read aloud works now.</p>
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby='history-title'>
        <h2 id='history-title' className='mb-4 font-serif text-2xl font-semibold'>
          Listening history
        </h2>
        <DataTable
          label='Listening history'
          columns={sessionColumns}
          data={sessions}
          getRowId={(s) => s.id}
          pageSize={8}
          empty={<EmptyState size='compact' title='No listening sessions yet' description='Sessions appear here after you listen to a note or book.' />}
          renderMobileRow={(s) => (
            <Link href={s.href} className='flex items-center justify-between gap-3 rounded-[12px] border border-[var(--border-subtle)] bg-white p-4'>
              <span className='min-w-0'>
                <span className='block truncate font-medium'>{s.title}</span>
                <span className='text-sm text-[var(--text-secondary)]'>
                  {formatDate(s.startedAt)} · {formatDuration(s.durationSec)}
                </span>
              </span>
              <Badge>{s.mode === 'read' ? 'Read' : 'Tutor'}</Badge>
            </Link>
          )}
        />
      </section>
    </div>
  )
}

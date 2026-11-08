'use client'

// Read-aloud engine on the browser's SpeechSynthesis API. Drives the voice store from event
// callbacks (no React hooks needed, ARCHITECTURE.md §10). The Vapi voice tutor will plug into
// the same store once its keys are configured.

import { toast } from 'sonner'

import { canUseVoice, logVoiceSession } from '@/features/account/account-actions'
import { useVoiceStore } from '@/stores/voice-store'
import type { VoiceSource } from '@/types'

let sentences: string[] = []
let index = 0
let lastBoundaryAt = 0

const store = () => useVoiceStore.getState()

export const speechSupported = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window

/** Strip markdown-lite syntax and split into sentence-sized chunks */
function toSentences(text: string): string[] {
  return text
    .replace(/^#+\s*/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*/g, '')
    .split(/(?<=[.!?:])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function finishSession(): void {
  const { startedAt, source, mode } = store()
  if (startedAt && source) {
    const durationSec = Math.round((Date.now() - startedAt) / 1000)
    if (durationSec >= 1) {
      void logVoiceSession({ mode, title: source.title, href: `/${source.kind}s/${source.slug}`, durationSec })
    }
  }
}

function speakFrom(i: number): void {
  const synth = window.speechSynthesis
  const sentence = sentences[i]
  if (sentence === undefined) {
    finishSession()
    store().setProgress(1, sentences.length)
    store().setStatus('ended')
    return
  }
  index = i
  const utterance = new SpeechSynthesisUtterance(sentence)
  utterance.rate = store().rate
  utterance.onstart = () => {
    store().setStatus('speaking')
    store().setProgress(i / sentences.length, i)
  }
  // Word boundaries fire very often: throttle progress updates to ~4/s (UI_ENGINEERING.md #8)
  utterance.onboundary = (event) => {
    const now = Date.now()
    if (now - lastBoundaryAt < 250) return
    lastBoundaryAt = now
    const within = sentence.length ? event.charIndex / sentence.length : 0
    store().setProgress((i + within) / sentences.length, i)
  }
  utterance.onend = () => {
    if (store().status === 'speaking') speakFrom(i + 1)
  }
  utterance.onerror = (event) => {
    if (event.error === 'interrupted' || event.error === 'canceled') return
    store().setStatus('error', 'Reading stopped unexpectedly. Try again.')
  }
  synth.speak(utterance)
}

/** Start reading a note or book aloud (checks the voice quota on the server first) */
export async function startReading(source: VoiceSource, onUpgrade: () => void): Promise<void> {
  if (!speechSupported()) {
    toast.error('Your browser can’t read aloud. Try Chrome, Edge or Safari.')
    return
  }
  const allowed = await canUseVoice()
  if (!allowed.ok) {
    toast.error(allowed.error.message, { action: { label: 'Upgrade', onClick: onUpgrade } })
    return
  }
  window.speechSynthesis.cancel()
  sentences = toSentences(source.text)
  store().setMode('read')
  store().setSource(source)
  store().setStatus('connecting')
  speakFrom(0)
}

export function pauseReading(): void {
  window.speechSynthesis.pause()
  store().setStatus('paused')
}

export function resumeReading(): void {
  window.speechSynthesis.resume()
  store().setStatus('speaking')
}

export function stopReading(): void {
  finishSession()
  window.speechSynthesis.cancel()
  store().reset()
}

export function changeRate(rate: number): void {
  store().setRate(rate)
  if (store().status === 'speaking') {
    window.speechSynthesis.cancel()
    speakFrom(index) // restart the current sentence at the new speed
  }
}

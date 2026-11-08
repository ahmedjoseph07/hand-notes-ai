'use client'

import { create } from 'zustand'

import type { VoiceState } from '@/types'

const initial = {
  status: 'idle',
  mode: 'read',
  source: null,
  progress: 0,
  sentenceIndex: 0,
  rate: 1,
  startedAt: null,
  error: null,
} as const satisfies Partial<VoiceState>

/**
 * Voice session state. Updated from speech/Vapi event callbacks via
 * `useVoiceStore.getState()` (no hooks needed outside React); components
 * subscribe to single fields so frequent progress updates stay cheap.
 */
export const useVoiceStore = create<VoiceState>()((set) => ({
  ...initial,
  setSource: (source) => set({ source, progress: 0, sentenceIndex: 0, status: 'idle', error: null }),
  setStatus: (status, error = null) =>
    set((s) => ({
      status,
      error,
      startedAt: status === 'speaking' && s.startedAt === null ? Date.now() : status === 'idle' || status === 'ended' ? null : s.startedAt,
    })),
  setProgress: (progress, sentenceIndex) => set({ progress, sentenceIndex }),
  setRate: (rate) => set({ rate }),
  setMode: (mode) => set({ mode }),
  reset: () => set({ ...initial }),
}))

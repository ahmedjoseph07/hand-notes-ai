'use client'

import { create } from 'zustand'

import type { ConfirmState } from '@/types'

/** Backs `useConfirm()`: one confirmation dialog for the whole app (UI_ENGINEERING.md #19) */
export const useConfirmStore = create<ConfirmState>()((set, get) => ({
  request: null,
  resolve: null,
  confirm: (request) =>
    new Promise<boolean>((resolve) => {
      get().resolve?.(false) // a new request cancels any open one
      set({ request, resolve })
    }),
  settle: (confirmed) => {
    get().resolve?.(confirmed)
    set({ request: null, resolve: null })
  },
}))

/** `if (!(await confirm({...}))) return` */
export const useConfirm = () => useConfirmStore((s) => s.confirm)

'use client'

import { createStore } from 'zustand'

import type { SelectionState } from '@/types'

/** Create a selection store for one list (UI_ENGINEERING.md #10). Use with `useStore`. */
export const createSelectionStore = () =>
  createStore<SelectionState>()((set, get) => ({
    selected: new Set<string>(),
    anchorId: null,
    toggle: (id) => {
      const next = new Set(get().selected)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      set({ selected: next, anchorId: id })
    },
    selectRange: (orderedIds, toId) => {
      const { anchorId, selected } = get()
      const from = anchorId ? orderedIds.indexOf(anchorId) : -1
      const to = orderedIds.indexOf(toId)
      if (from === -1 || to === -1) return get().toggle(toId)
      const [start, end] = from < to ? [from, to] : [to, from]
      const next = new Set(selected)
      orderedIds.slice(start, end + 1).forEach((id) => next.add(id))
      set({ selected: next, anchorId: toId })
    },
    setAll: (ids) => set({ selected: new Set(ids), anchorId: null }),
    clear: () => set({ selected: new Set(), anchorId: null }),
  }))

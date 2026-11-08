import type { VoiceMode, VoiceSource, VoiceStatus } from './voice'

/** App-shell UI state (stores/ui-store.ts) */
export interface UiState {
  sidebarCollapsed: boolean
  paletteOpen: boolean
  shortcutsOpen: boolean
  mobileNavOpen: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setPaletteOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void
  setMobileNavOpen: (open: boolean) => void
}

export interface ConfirmRequest {
  title: string
  description: string
  confirmLabel: string
  /** Red styling; focus starts on Cancel */
  destructive?: boolean
  /** Require typing this exact text to enable the confirm button */
  typeToConfirm?: string
}

/** Promise-based confirmation dialog (stores/confirm-store.ts) */
export interface ConfirmState {
  request: ConfirmRequest | null
  resolve: ((confirmed: boolean) => void) | null
  confirm: (request: ConfirmRequest) => Promise<boolean>
  settle: (confirmed: boolean) => void
}

/** Bulk selection for one list (stores/selection-store.ts) */
export interface SelectionState {
  selected: ReadonlySet<string>
  /** Anchor for shift-click range selection */
  anchorId: string | null
  toggle: (id: string) => void
  selectRange: (orderedIds: readonly string[], toId: string) => void
  setAll: (ids: readonly string[]) => void
  clear: () => void
}

/** Read-aloud / voice tutor session (stores/voice-store.ts) */
export interface VoiceState {
  status: VoiceStatus
  mode: VoiceMode
  source: VoiceSource | null
  /** 0–1 position in the text being read */
  progress: number
  /** Index of the sentence being read */
  sentenceIndex: number
  rate: number
  startedAt: number | null
  error: string | null
  setSource: (source: VoiceSource | null) => void
  setStatus: (status: VoiceStatus, error?: string | null) => void
  setProgress: (progress: number, sentenceIndex: number) => void
  setRate: (rate: number) => void
  setMode: (mode: VoiceMode) => void
  reset: () => void
}

/** Read-aloud uses the browser's speech engine; tutor uses Vapi */
export type VoiceMode = 'read' | 'tutor'

export type VoiceStatus = 'idle' | 'connecting' | 'speaking' | 'paused' | 'ended' | 'error'

export interface VoiceSession {
  id: string
  mode: VoiceMode
  /** Title of the note or book */
  title: string
  /** /notes/… or /books/… */
  href: string
  /** ISO date-time */
  startedAt: string
  durationSec: number
}

/** Something that can be read aloud or discussed */
export interface VoiceSource {
  kind: 'note' | 'book'
  slug: string
  title: string
  /** Plain text to read aloud */
  text: string
}

/** Error codes a Server Action can return. Expected failures are values, not exceptions. */
export type ActionErrorCode =
  | 'UNAUTHENTICATED'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'LIMIT_REACHED'
  | 'CONFLICT'
  | 'UNKNOWN'

export interface ActionError {
  code: ActionErrorCode
  message: string
  /** Field name → message, for VALIDATION errors */
  fieldErrors?: Readonly<Record<string, string>>
  /** Server's current version, for CONFLICT errors (autosave "Keep mine") */
  currentVersion?: number
}

/** Result of every Server Action: narrow on `ok` before reading `data` or `error` */
export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: ActionError }

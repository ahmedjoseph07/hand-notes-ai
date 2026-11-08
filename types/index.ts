// Single entry point for shared types: import type { Book, Note } from '@/types'
// Type-only re-exports: nothing here exists at runtime.

export type { Book, CatalogBook, BookShelf, LibraryBook } from './book'
export type {
  NoteAccent,
  NoteSource,
  NoteBase,
  ReadyNote,
  ProcessingNote,
  Note,
  NoteStatus,
  ReadyNoteDetail,
  ProcessingNoteDetail,
  NoteDetail,
  TrashedNote,
} from './note'
export type { KeyTerm, FlashcardRating, Flashcard, DueCard, QuizQuestion, StudyStats, StudyDeck } from './study'
export type { NoteSort, NoteView, NoteFilters, BookFilters } from './filters'
export type { ActionErrorCode, ActionError, ActionResult } from './actions'
export type {
  Plan,
  FeatureKey,
  UsageMeterValue,
  UsageSummary,
  StudyLevel,
  LearningStyle,
  StudyPreferences,
  OnboardingProfile,
  ReferralInvite,
  ReferralSummary,
  AffiliateStatus,
  AffiliateApplication,
} from './account'
export type { NoteRecord, BookStateRecord, UserRecord } from './records'
export type { Debounced, ThrottleOptions, Throttled, AutosaveStatus, AutosaveOptions, AutosaveState, HotkeyOptions } from './hooks'
export type { UiState, ConfirmRequest, ConfirmState, SelectionState, VoiceState } from './stores'
export type { VoiceMode, VoiceStatus, VoiceSession, VoiceSource } from './voice'
export type {
  LinkAction,
  NavItem,
  AppNavItem,
  CommandGroup,
  CommandDefinition,
  Shortcut,
  SearchResult,
} from './navigation'
export type {
  BookCardProps,
  NoteCardProps,
  SectionHeaderProps,
  NavMenuProps,
  EmptyStateProps,
  PageHeaderProps,
  DataTableProps,
  DataTableFeatures,
  HeroStep,
  ImageAsset,
  FeatureHighlight,
  PlanCard,
  FieldProps,
  MenuContentProps,
  DialogVariant,
  DialogContentProps,
  TooltipProps,
  NotFoundViewProps,
  ErrorStateProps,
  ErrorBoundaryProps,
  ErrorBoundaryState,
  NotesWorkspaceProps,
  BulkActionBarProps,
  VoiceStudioProps,
} from './components'

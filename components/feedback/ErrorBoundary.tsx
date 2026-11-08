'use client'

import { Component, type ErrorInfo } from 'react'

import { ErrorState } from '@/components/feedback/ErrorState'
import type { ErrorBoundaryProps, ErrorBoundaryState } from '@/types'

/**
 * Widget-level boundary (UI_ENGINEERING.md #20): a failing panel shows a small
 * fallback with Retry while the rest of the page keeps working.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // Report to the error tracker once one is configured (ARCHITECTURE.md §12)
    console.error(`[${this.props.name}]`, error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          compact
          title={`${this.props.name} stopped working`}
          message='The rest of the page still works. Try reloading this part.'
          onRetry={() => this.setState({ hasError: false })}
        />
      )
    }
    return this.props.children
  }
}

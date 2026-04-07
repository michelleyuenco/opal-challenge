import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
              <p className="mt-1 text-sm text-gray-500">
                {this.state.error?.message ?? 'An unexpected error occurred.'}
              </p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

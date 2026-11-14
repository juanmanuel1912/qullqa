/**
 * Error Boundary para capturar errores React
 */

import React, { ReactNode, Component } from 'react'
import { Button } from './Button'

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-tierra-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <h1 className="text-xl font-bold text-noche mb-2">Algo salió mal</h1>
              <p className="text-tierra-600 mb-6">
                {this.state.error?.message || 'Un error inesperado ocurrió.'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Recargar página
              </Button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

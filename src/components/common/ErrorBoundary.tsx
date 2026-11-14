import { Component, type ErrorInfo, type ReactNode } from 'react'
import { translate, type Lang } from '@/i18n'

function savedLang(): Lang {
  try {
    const v = localStorage.getItem('qullqa:v1:lang')
    if (v === 'es' || v === 'qu') return v
  } catch {
    /* ignorar */
  }
  return 'en'
}

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Qullqa error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-noche-800 p-6 text-center text-white">
        <div className="max-w-sm space-y-4">
          <p className="font-display text-2xl">{translate(savedLang(), 'error.title')}</p>
          <p className="text-noche-100">{this.state.error.message}</p>
          <button
            className="btn-primary w-full"
            onClick={() => {
              try {
                localStorage.removeItem('qullqa:v1:profile')
              } catch {
                /* ignorar */
              }
              window.location.assign('/')
            }}
          >
            {translate(savedLang(), 'error.restart')}
          </button>
        </div>
      </div>
    )
  }
}

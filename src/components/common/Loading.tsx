/**
 * Spinner / Loading state
 */

interface LoadingProps {
  message?: string
  fullScreen?: boolean
}

export function Loading({ message = 'Cargando...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-tierra-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-inti border-r-inti animate-spin" />
      </div>
      {message && <p className="text-tierra-700 font-medium text-center">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/95 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

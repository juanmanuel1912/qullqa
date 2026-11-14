/**
 * Componente de atribución "Datos: NASA"
 */

interface AttributionProps {
  className?: string
  inline?: boolean
}

export function Attribution({ className = '', inline = false }: AttributionProps) {
  const content = (
    <p className={`text-xs text-tierra-600 ${className}`}>
      Datos:{' '}
      <a
        href="https://api.nasa.gov"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-tierra hover:text-inti underline"
      >
        NASA
      </a>
    </p>
  )

  if (inline) {
    return content
  }

  return (
    <footer className="mt-6 py-4 border-t border-tierra-100">
      {content}
    </footer>
  )
}

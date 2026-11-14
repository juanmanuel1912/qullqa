import { useI18n } from '@/i18n'

/**
 * Compartir en WhatsApp y Facebook (sin cuentas ni API: solo enlaces públicos de compartir).
 * Si el teléfono lo permite, también el menú nativo de "Compartir".
 */
export function ShareButtons({ text, path, compact = false }: { text: string; path: string; compact?: boolean }) {
  const { t } = useI18n()
  const url = `${window.location.origin}${path}`
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const size = compact ? 'min-h-[36px] px-3 text-xs' : 'min-h-[44px] px-4 text-sm'

  return (
    <div className="flex flex-wrap gap-2" aria-label={t('share.title')}>
      <a href={wa} target="_blank" rel="noopener noreferrer" className={`btn ${size} bg-[#25D366] text-white`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8.9-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z" />
        </svg>
        {t('share.whatsapp')}
      </a>
      <a href={fb} target="_blank" rel="noopener noreferrer" className={`btn ${size} bg-[#1877F2] text-white`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4a22 22 0 0 0-2.5-.1c-2.5 0-4.1 1.5-4.1 4.3v2.3H7.4V14h2.8v8z" />
        </svg>
        {t('share.facebook')}
      </a>
      {canNative && (
        <button
          onClick={() => {
            navigator.share({ title: 'Qullqa', text, url }).catch(() => undefined)
          }}
          className={`btn-ghost ${size}`}
        >
          ↗ {t('share.more')}
        </button>
      )}
    </div>
  )
}

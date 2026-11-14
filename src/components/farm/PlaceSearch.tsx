import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n'
import { searchPlaces, type Place } from '@/services/weather/geocoding'

/** Buscador de lugares por nombre: el agricultor escribe su pueblo o distrito. */
export function PlaceSearch({ onPick }: { onPick: (p: Place) => void }) {
  const { t, lang } = useI18n()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [state, setState] = useState<'idle' | 'searching' | 'done' | 'error'>('idle')

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      setState('idle')
      return
    }
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      setState('searching')
      searchPlaces(q, lang, ctrl.signal)
        .then((r) => {
          setResults(r)
          setState('done')
        })
        .catch((e: unknown) => {
          if ((e as Error).name !== 'AbortError') setState('error')
        })
    }, 400)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [q, lang])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-extrabold text-tierra-700">
        🔎 {t('farm.search.label')}
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('farm.search.placeholder')}
          className="mt-1 block min-h-[48px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base font-semibold"
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>
      {state === 'searching' && <p className="text-xs font-semibold text-tierra-600">{t('farm.search.searching')}</p>}
      {state === 'error' && <p className="text-xs font-semibold text-risk">{t('farm.search.error')}</p>}
      {state === 'done' && results.length === 0 && <p className="text-xs font-semibold text-tierra-600">{t('farm.search.none')}</p>}
      {results.length > 0 && (
        <ul className="divide-y divide-tierra-100 overflow-hidden rounded-2xl border-2 border-tierra-100">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  onPick(p)
                  setQ('')
                  setResults([])
                  setState('idle')
                }}
                className="flex min-h-[52px] w-full items-center justify-between gap-2 bg-white px-3 py-2 text-left hover:bg-tierra-50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-extrabold">📍 {p.name}</span>
                  <span className="block truncate text-xs text-tierra-600">{[p.admin1, p.country].filter(Boolean).join(', ')}</span>
                </span>
                {p.elevation != null && (
                  <span className="shrink-0 rounded-full bg-tierra-100 px-2 py-0.5 text-xs font-bold text-tierra-800">
                    {Math.round(p.elevation).toLocaleString()} m
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

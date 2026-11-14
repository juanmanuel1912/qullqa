import { lazy, Suspense, useMemo, useState } from 'react'
import { useI18n, type Key } from '@/i18n'
import { POTATOES, type PotatoKind } from '@/lib/potato/catalog'
import { Skeleton } from '@/components/common'

const PointsMap = lazy(() => import('@/components/map/PointsMap'))

const KIND_COLOR: Record<PotatoKind, string> = { improved: '#3d4577', native: '#2f9e44', bitter: '#9c7a4f' }

export function PotatoMap() {
  const { t, L } = useI18n()
  const [selected, setSelected] = useState<string | null>('yungay')
  const points = useMemo(
    () => POTATOES.map((p) => ({ id: p.id, lat: p.map[0], lon: p.map[1], label: p.name, color: KIND_COLOR[p.kind] })),
    [],
  )
  const sel = POTATOES.find((p) => p.id === selected)

  return (
    <section className="space-y-3">
      <p className="text-[15px] text-tierra-800">{t('pot.mapIntro')}</p>
      <Suspense fallback={<Skeleton className="h-80" />}>
        <PointsMap points={points} selected={selected} onSelect={setSelected} height="h-80" ariaLabel={t('pot.tab.map')} />
      </Suspense>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-tierra-700">
        {(Object.keys(KIND_COLOR) as PotatoKind[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: KIND_COLOR[k] }} />
            {t(`pot.kind.${k}` as Key)}
          </span>
        ))}
      </div>
      {sel && (
        <article className="card space-y-1" aria-live="polite">
          <p className="text-lg font-extrabold">{sel.name}</p>
          <p className="text-sm font-bold text-inti-800">
            {L(sel.where)} · {sel.altitude[0].toLocaleString()}–{sel.altitude[1].toLocaleString()} m
          </p>
          <p className="text-sm text-tierra-800">{L(sel.uses)}</p>
        </article>
      )}
      <div className="flex flex-wrap gap-2">
        {POTATOES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`chip ${selected === p.id ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
          >
            {p.name.split(' (')[0]}
          </button>
        ))}
      </div>
    </section>
  )
}

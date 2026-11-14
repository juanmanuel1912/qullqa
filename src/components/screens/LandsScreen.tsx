import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { fetchClimatology } from '@/services/nasa'
import type { Climatology } from '@/services/nasa/types'
import { getCropStatus, projectDateForGdd, recommendSowing, VARIETIES } from '@/lib/agro'
import { DEMO_FARMER, DEMO_FARMS, type Farm } from '@/lib/farms/demo'
import { Attribution, IconArrow, Notice, ProgressRing, Skeleton } from '@/components/common'

const PointsMap = lazy(() => import('@/components/map/PointsMap'))

const STATUS_COLOR = { growing: '#2f9e44', ready: '#d4af37', harvested: '#9c7a4f' } as const

export default function LandsScreen() {
  const { profile, updateProfile, today } = useQullqa()
  const { t, L } = useI18n()
  const navigate = useNavigate()
  const [clims, setClims] = useState<Record<string, Climatology>>({})
  const [selected, setSelected] = useState<string | null>(null)

  // Climatología NASA de cada chacra (con caché)
  useEffect(() => {
    const ctrl = new AbortController()
    DEMO_FARMS.forEach((f) =>
      fetchClimatology(f.lat, f.lon, ctrl.signal)
        .then((c) => setClims((prev) => ({ ...prev, [f.id]: c })))
        .catch(() => undefined),
    )
    return () => ctrl.abort()
  }, [])

  const totalHa = DEMO_FARMS.reduce((s, f) => s + f.areaHa, 0)
  const countries = new Set(DEMO_FARMS.map((f) => f.country.en)).size
  const points = useMemo(
    () =>
      DEMO_FARMS.map((f) => ({
        id: f.id,
        lat: f.lat,
        lon: f.lon,
        label: `${f.name} (${f.code})`,
        color: f.plantingDate ? STATUS_COLOR.growing : STATUS_COLOR.ready,
      })),
    [],
  )

  const open = (f: Farm) => {
    updateProfile({ lat: f.lat, lon: f.lon, placeName: f.place, variety: f.variety, plantingDate: f.plantingDate, onboarded: true })
    navigate(f.plantingDate ? '/cultivo' : '/calendario')
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3 pt-2">
        <div>
          <h1 className="font-display text-3xl text-noche-800">{t('lands.title')}</h1>
          <p className="mt-1 text-[15px] text-tierra-700">{t('lands.subtitle')}</p>
        </div>
        <Link to="/perfil" className="flex shrink-0 flex-col items-center gap-1" aria-label={t('profile.view')}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-noche-800 font-extrabold text-inti-300">{DEMO_FARMER.initials}</span>
          <span className="text-[10px] font-bold text-tierra-500">{DEMO_FARMER.name.split(' ')[0]}</span>
        </Link>
      </header>

      <Notice tone="info">{t('lands.demo')}</Notice>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="stat">
          <p className="stat-value">{DEMO_FARMS.length}</p>
          <p className="stat-label">{L({ en: 'fields', es: 'chacras' })}</p>
        </div>
        <div className="stat">
          <p className="stat-value">{totalHa}</p>
          <p className="stat-label">ha</p>
        </div>
        <div className="stat">
          <p className="stat-value">{countries}</p>
          <p className="stat-label">{L({ en: 'countries', es: 'países' })}</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-64" />}>
        <PointsMap points={points} selected={selected} onSelect={setSelected} ariaLabel={t('lands.mapAria')} />
      </Suspense>

      <ul className="space-y-3">
        {DEMO_FARMS.map((f) => (
          <FarmCard
            key={f.id}
            farm={f}
            clim={clims[f.id]}
            today={today}
            active={Math.abs(profile.lat - f.lat) < 0.01 && Math.abs(profile.lon - f.lon) < 0.01}
            highlighted={selected === f.id}
            onSelect={() => setSelected(f.id)}
            onOpen={() => open(f)}
          />
        ))}
      </ul>

      <p className="rounded-2xl bg-tierra-100 p-4 text-sm text-tierra-900">{t('lands.hemisphere')}</p>

      <Link to="/perfil" className="btn-primary w-full">
        {t('profile.view')} <IconArrow size={18} />
      </Link>
      <Link to="/chacra" className="btn-ghost w-full">
        {t('lands.edit')}
      </Link>
      <p className="text-center text-xs text-tierra-500">{L({ en: 'Map: OpenStreetMap', es: 'Mapa: OpenStreetMap' })}</p>
      <Attribution />
    </div>
  )
}

function FarmCard(props: {
  farm: Farm
  clim?: Climatology
  today: Date
  active: boolean
  highlighted: boolean
  onSelect: () => void
  onOpen: () => void
}) {
  const { farm: f, clim, today } = props
  const { t, L, month, fmtLong } = useI18n()
  const variety = VARIETIES[f.variety]

  let body: React.ReactNode = <Skeleton className="h-16" />
  let ring: number | null = null

  if (clim) {
    if (f.plantingDate) {
      const sow = new Date(`${f.plantingDate}T00:00:00Z`)
      const harvest = projectDateForGdd(sow, 0, variety.gddToHarvest, clim)
      if (harvest && harvest <= today) {
        body = (
          <>
            <p className="font-bold text-tierra-700">✅ {t('lands.harvested', { date: fmtLong(harvest) })}</p>
            {f.season && <p className="text-sm text-tierra-700">{t('lands.nextSeason', { sow: L(f.season.sow), harvest: L(f.season.harvest) })}</p>}
          </>
        )
      } else {
        const s = getCropStatus({ sowingDate: sow, variety: f.variety, climatology: clim, today })
        ring = s.progress
        body = (
          <>
            <p className="font-bold">
              {t(`stage.${s.stage.id}` as Key)} · {t('status.daysLeft', { n: s.daysToHarvest ?? '—' })}
            </p>
            <p className="text-sm text-tierra-700">
              {t('lands.planted', { date: fmtLong(sow) })}
              {s.harvestDate && <> · {t('lands.harvest', { date: fmtLong(s.harvestDate) })}</>}
            </p>
          </>
        )
      }
    } else {
      const r = recommendSowing(clim, f.variety, today)
      body = (
        <>
          <p className="font-bold text-good">
            🌱 {r.daysUntil === 0 ? t('status.sowNow') : t('lands.sowIn', { month: month(r.best.month) })}
          </p>
          {r.best.harvestDate && <p className="text-sm text-tierra-700">{t('lands.harvest', { date: fmtLong(r.best.harvestDate) })}</p>}
        </>
      )
    }
  }

  return (
    <li
      className={`card space-y-3 transition ${props.highlighted ? 'ring-2 ring-noche-800' : ''}`}
      onClick={props.onSelect}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-noche-800 text-sm font-extrabold tracking-wider text-inti-300">
          {f.code}
        </span>
        <div className="flex-1">
          <p className="text-lg font-extrabold leading-tight">{f.name}</p>
          <p className="text-sm text-tierra-600">
            {f.place}, {L(f.country)} · {t('lands.area', { n: f.areaHa })}
          </p>
          <p className="mt-0.5 text-xs font-bold text-inti-800">
            🥔 {variety.name}
            {f.calendar === 'local' && <> · {t('lands.irrigated')}</>}
          </p>
        </div>
        {ring !== null && (
          <ProgressRing value={ring} size={56} stroke={7}>
            <span className="text-xs font-extrabold">{Math.round(ring * 100)}%</span>
          </ProgressRing>
        )}
      </div>
      <div className="space-y-0.5">{body}</div>
      <p className="text-xs text-tierra-600">{L(f.note)}</p>
      {props.active ? (
        <span className="inline-block rounded-full bg-inti-100 px-3 py-1 text-xs font-bold text-inti-900">⭐ {t('lands.active')}</span>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            props.onOpen()
          }}
          className="btn-dark min-h-[40px] w-full text-sm"
        >
          {t('lands.open')} <IconArrow size={16} />
        </button>
      )}
    </li>
  )
}

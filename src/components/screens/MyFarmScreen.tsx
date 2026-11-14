import { lazy, Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { VARIETY_LIST } from '@/lib/agro'
import { IconArrow, IconGps, IconPin, Notice, Skeleton, Attribution } from '@/components/common'
import { todayIso } from '@/utils/format'

const FarmMap = lazy(() => import('@/components/map/FarmMap'))

/** Zonas paperas andinas para elegir rápido (o para la demo). */
const PLACES = [
  { name: 'Cusco', lat: -13.5319, lon: -71.9754 },
  { name: 'Puno', lat: -15.8402, lon: -70.0219 },
  { name: 'Huancayo', lat: -12.0651, lon: -75.2049 },
  { name: 'Ayacucho', lat: -13.1588, lon: -74.2239 },
  { name: 'Cajamarca', lat: -7.1638, lon: -78.5003 },
  { name: 'Huaraz', lat: -9.5278, lon: -77.5278 },
  { name: 'La Paz', lat: -16.4897, lon: -68.1193 },
  { name: 'Quito', lat: -0.1807, lon: -78.4678 },
]

export default function MyFarmScreen() {
  const navigate = useNavigate()
  const { profile, updateProfile, climatology, sowing } = useQullqa()
  const { t, fmtLong } = useI18n()
  const [gps, setGps] = useState<'idle' | 'locating' | 'error'>('idle')
  const [planted, setPlanted] = useState(profile.plantingDate !== null)

  const pick = (lat: number, lon: number, placeName: string) =>
    updateProfile({ lat: Math.round(lat * 1e4) / 1e4, lon: Math.round(lon * 1e4) / 1e4, placeName })

  const useGps = () => {
    if (!navigator.geolocation) return setGps('error')
    setGps('locating')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        pick(p.coords.latitude, p.coords.longitude, t('farm.gpsName'))
        setGps('idle')
      },
      () => setGps('error'),
      { timeout: 10_000, maximumAge: 600_000 },
    )
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">{t('farm.step')}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('farm.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('farm.subtitle')}</p>
      </header>

      {/* Ubicación */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <IconPin size={20} className="text-inti-600" /> {t('farm.where')}
          </h2>
        </div>

        <button onClick={useGps} className="btn-dark w-full" disabled={gps === 'locating'}>
          <IconGps size={20} />
          {gps === 'locating' ? t('farm.locating') : t('farm.gps')}
        </button>
        {gps === 'error' && (
          <Notice tone="warning">{t('farm.gpsError')}</Notice>
        )}

        <div className="-mx-1 flex flex-wrap gap-2">
          {PLACES.map((p) => {
            const active = profile.placeName === p.name
            return (
              <button
                key={p.name}
                onClick={() => pick(p.lat, p.lon, p.name)}
                className={`chip ${active ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
              >
                {p.name}
              </button>
            )
          })}
        </div>

        <Suspense fallback={<Skeleton className="h-56" />}>
          <FarmMap lat={profile.lat} lon={profile.lon} onPick={(lat, lon) => pick(lat, lon, t('farm.mapPoint'))} />
        </Suspense>
        <div className="flex items-center justify-between text-xs text-tierra-600">
          <span>
            {t('farm.mapHint')}{' '}
            {t('farm.ndvi', { green: '§' }).split('§')[0]}
            <span className="font-bold text-good">{t('farm.green')}</span>
            {t('farm.ndvi', { green: '§' }).split('§')[1]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="stat">
            <p className="stat-label">{t('farm.coords')}</p>
            <p className="mt-0.5 text-sm font-extrabold">
              {profile.lat.toFixed(3)}, {profile.lon.toFixed(3)}
            </p>
          </div>
          <div className="stat">
            <p className="stat-label">{t('farm.altitude')}</p>
            <p className="mt-0.5 text-sm font-extrabold">
              {climatology?.elevation ? `${Math.round(climatology.elevation).toLocaleString('es-PE')} m` : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Variedad */}
      <section className="card space-y-3">
        <h2 className="text-lg font-extrabold">🥔 {t('farm.variety')}</h2>
        <div className="space-y-2" role="radiogroup" aria-label={t('farm.variety')}>
          {VARIETY_LIST.map((v) => {
            const active = profile.variety === v.id
            return (
              <button
                key={v.id}
                role="radio"
                aria-checked={active}
                onClick={() => updateProfile({ variety: v.id })}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  active ? 'border-inti bg-inti-50' : 'border-tierra-100 bg-white hover:border-tierra-200'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? 'border-inti-600 bg-inti' : 'border-tierra-300'
                  }`}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-noche-800" />}
                </span>
                <span className="flex-1">
                  <span className="block font-extrabold">{v.name}</span>
                  <span className="block text-sm text-tierra-700">{t(`variety.${v.id}` as Key)}</span>
                </span>
                <span className="shrink-0 rounded-full bg-tierra-100 px-2.5 py-1 text-xs font-bold text-tierra-800">
                  {v.typicalDays[0]}–{v.typicalDays[1]} d
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Fecha de siembra */}
      <section className="card space-y-3">
        <h2 className="text-lg font-extrabold">🌱 {t('farm.planted')}</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setPlanted(false)
              updateProfile({ plantingDate: null })
            }}
            className={`chip justify-center ${!planted ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white'}`}
          >
            {t('farm.notYet')}
          </button>
          <button
            onClick={() => {
              setPlanted(true)
              if (!profile.plantingDate) updateProfile({ plantingDate: todayIso() })
            }}
            className={`chip justify-center ${planted ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white'}`}
          >
            {t('farm.yesPlanted')}
          </button>
        </div>
        {planted ? (
          <label className="block">
            <span className="text-sm font-semibold text-tierra-700">{t('farm.plantingDate')}</span>
            <input
              type="date"
              max={todayIso()}
              value={profile.plantingDate ?? ''}
              onChange={(e) => updateProfile({ plantingDate: e.target.value || null })}
              className="mt-1 block min-h-[48px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base font-bold"
            />
          </label>
        ) : (
          sowing && (
            <p className="text-sm text-tierra-700">
              {t('farm.recommend', { date: fmtLong(sowing.best.sowDate) })}
            </p>
          )
        )}
      </section>

      <button
        onClick={() => {
          updateProfile({ onboarded: true })
          navigate(profile.plantingDate ? '/cultivo' : '/calendario')
        }}
        className="btn-primary w-full text-lg"
      >
        {profile.plantingDate ? t('farm.ctaCrop') : t('farm.ctaCalendar')} <IconArrow size={20} />
      </button>

      <Attribution />
    </div>
  )
}

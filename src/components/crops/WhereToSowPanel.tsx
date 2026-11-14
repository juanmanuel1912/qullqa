import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { adjustToElevation, farmIndicators, zoneInfo } from '@/lib/farms/indicators'
import { appCropNeeds, APP_CROPS, fitHere, type CropNeeds, type FitResult, type FitVerdict } from '@/lib/crops/fit'
import { CROP_PRESETS, useCustomCrops, type CustomCropInput } from '@/lib/crops/customCrops'
import { NEXT_CROPS } from '@/lib/rotation/nextCrop'
import { useLocateFarm } from '@/hooks/useLocateFarm'
import { Skeleton } from '@/components/common'

interface Row {
  id: string
  name: string
  emoji: string
  custom: boolean
  fit: FitResult
}

const GROUPS: { v: FitVerdict; icon: string; title: Key; box: string }[] = [
  { v: 'good', icon: '✅', title: 'where.can', box: 'bg-green-50' },
  { v: 'fair', icon: '🤔', title: 'where.careful', box: 'bg-inti-50' },
  { v: 'bad', icon: '👎', title: 'where.cannot', box: 'bg-red-50' },
]

/**
 * "¿Dónde voy a sembrar?": tu ALTURA y tu CLIMA (NASA, ajustado a tu altura)
 * y qué productos puedes sembrar y cuáles no, con la razón.
 */
export function WhereToSowPanel() {
  const { profile, climatology, forecast } = useQullqa()
  const { t, month, list } = useI18n()
  const { status, locate } = useLocateFarm()
  const { crops: custom, add, remove } = useCustomCrops()
  const [irrigation, setIrrigation] = useState(false)
  const [adding, setAdding] = useState(false)
  const elevation = Math.round(forecast?.elevation ?? climatology?.elevation ?? 0)
  const clim = useMemo(() => (climatology ? adjustToElevation(climatology, elevation).clim : null), [climatology, elevation])
  const ind = useMemo(() => (clim ? farmIndicators(clim, elevation) : null), [clim, elevation])

  const rows: Row[] = useMemo(() => {
    if (!clim) return []
    const app = APP_CROPS.map((id) => ({ id, name: t(`rotcrop.${id}` as Key), emoji: NEXT_CROPS[id].emoji, custom: false, fit: fitHere(appCropNeeds(id), clim, elevation, irrigation) }))
    const mine = custom.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, custom: true, fit: fitHere(c, clim, elevation, irrigation) }))
    return [...mine, ...app]
  }, [clim, elevation, irrigation, custom, t])

  if (!clim || !ind) return <Skeleton className="h-80" />

  /** La razón principal y, si se puede, cuándo sembrar */
  const reason = (f: FitResult) => {
    const why = mainReason(f)
    return f.verdict === 'fair' && f.bestMonths.length ? `${why} ${t('where.why.bestIn', { months: list(f.bestMonths.slice(0, 3).map((m) => month(m))) })}` : why
  }
  const mainReason = (f: FitResult) => {
    if (f.altitude.level === 'bad') return t('where.why.altitude', { min: f.altitude.min.toLocaleString(), max: f.altitude.max.toLocaleString(), elev: f.altitude.elevation.toLocaleString() })
    if (f.climate.level === 'bad') return t('where.why.cold', { need: f.climate.need, best: f.climate.best })
    if (f.frost.level === 'bad') return t('where.why.frost', { n: f.frost.months })
    if (f.water.level === 'bad') return t('where.why.water', { need: f.water.need, rain: f.water.rain })
    if (f.altitude.level === 'warn') return t('where.why.altitudeEdge', { min: f.altitude.min.toLocaleString(), max: f.altitude.max.toLocaleString() })
    if (f.climate.level === 'warn') return t('where.why.coolish', { need: f.climate.need, best: f.climate.best })
    if (f.frost.level === 'warn') return t('where.why.frostWarn')
    if (f.water.level === 'warn') return t('where.why.waterWarn', { need: f.water.need, rain: f.water.rain })
    return f.bestMonths.length ? t('where.why.sowIn', { months: list(f.bestMonths.slice(0, 4).map((m) => month(m))) }) : t('where.why.ok')
  }

  return (
    <section className="card space-y-4 ring-2 ring-noche-200">
      <div>
        <p className="eyebrow text-inti-700">📍 {profile.placeName}</p>
        <h2 className="font-display text-2xl leading-tight text-noche-800">{t('where.title')}</h2>
        <p className="mt-1 text-sm text-tierra-700">{t('where.subtitle')}</p>
      </div>

      {/* Los dos indicadores clave */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-3" style={{ background: `${zoneInfo(ind.zone).color}22` }}>
          <p className="text-xs font-bold text-tierra-600">⛰️ {t('where.altitude')}</p>
          <p className="mt-0.5 text-2xl font-extrabold text-noche-800">{ind.elevation.toLocaleString()} m</p>
          <p className="text-[11px] font-bold" style={{ color: zoneInfo(ind.zone).color }}>
            {zoneInfo(ind.zone).emoji} {t(`zone.${ind.zone}.name` as Key)}
          </p>
        </div>
        <div className="rounded-2xl bg-noche-50 p-3">
          <p className="text-xs font-bold text-tierra-600">🌡️ {t('where.climate')}</p>
          <p className="mt-0.5 text-2xl font-extrabold text-noche-800">{ind.meanTemp} °C</p>
          <p className="text-[11px] text-tierra-700">{t('where.climateRange', { cold: ind.coldest.t, warm: ind.warmest.t })}</p>
        </div>
        <div className={`rounded-2xl p-3 ${ind.frostMonths.length ? 'bg-blue-50' : 'bg-green-50'}`}>
          <p className="text-xs font-bold text-tierra-600">❄️ {t('where.frost')}</p>
          <p className="mt-0.5 text-lg font-extrabold text-noche-800">
            {ind.frostMonths.length ? t('myf.ind.frostN', { n: ind.frostMonths.length }) : t('myf.ind.noFrost')}
          </p>
          <p className="text-[11px] text-tierra-700">{t('myf.ind.min', { t: ind.minTemp })}</p>
        </div>
        <div className="rounded-2xl bg-tierra-50 p-3">
          <p className="text-xs font-bold text-tierra-600">🌧️ {t('where.rain')}</p>
          <p className="mt-0.5 text-lg font-extrabold text-noche-800">{ind.annualRain.toLocaleString()} mm</p>
          <p className="text-[11px] text-tierra-700">{t('myf.ind.rainyN', { n: ind.rainyMonths.length })}</p>
        </div>
      </div>
      <p className="rounded-2xl bg-noche-50 p-3 text-xs text-noche-800">💡 {t(`zone.${ind.zone}.text` as Key)}</p>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => locate({ onboarded: true })} disabled={status === 'locating'} className="btn-dark min-h-[40px] px-4 text-sm">
          {status === 'locating' ? t('farm.locating') : `🛰️ ${t('home.loc.gps')}`}
        </button>
        <Link to="/chacra" className="btn-ghost min-h-[40px] px-4 text-sm">
          🔎 {t('home.loc.pick')}
        </Link>
      </div>
      {status === 'error' && <p className="text-xs font-semibold text-risk">{t('farm.gpsError')}</p>}

      <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-bold text-tierra-800">
        <input type="checkbox" className="h-5 w-5 accent-noche-800" checked={irrigation} onChange={(e) => setIrrigation(e.target.checked)} />
        💧 {t('rot.check.irrigation')}
      </label>

      {/* Qué puedo sembrar y qué no */}
      <div className="space-y-2" aria-live="polite">
        <h3 className="font-extrabold text-noche-800">🌱 {t('where.listTitle')}</h3>
        {GROUPS.map((g) => {
          const items = rows.filter((r) => r.fit.verdict === g.v)
          if (items.length === 0) return null
          return (
            <div key={g.v} className={`rounded-2xl p-3 ${g.box}`}>
              <p className="mb-1.5 text-sm font-extrabold text-noche-800">
                {g.icon} {t(g.title)} ({items.length})
              </p>
              <ul className="space-y-1">
                {items.map((r) => (
                  <li key={r.id} className="flex items-start gap-2 rounded-xl bg-white/80 p-2">
                    <span className="text-xl leading-none" aria-hidden="true">
                      {r.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-tierra-900">
                        {r.name} {r.custom && <span className="rounded-full bg-inti-100 px-1.5 py-0.5 text-[10px] text-inti-900">⭐ {t('where.mine')}</span>}
                      </p>
                      <p className="text-xs text-tierra-700">{reason(r.fit)}</p>
                    </div>
                    {r.custom && (
                      <button
                        onClick={() => window.confirm(t('where.confirmDelete', { name: r.name })) && remove(r.id)}
                        className="h-8 w-8 shrink-0 rounded-full text-sm text-tierra-400 hover:bg-tierra-100"
                        aria-label={t('where.delete', { name: r.name })}
                      >
                        🗑️
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Agregar mis productos */}
      {adding ? (
        <AddCropForm
          onCancel={() => setAdding(false)}
          onSave={(c) => {
            add(c)
            setAdding(false)
          }}
          existing={custom.map((c) => c.name.toLowerCase())}
        />
      ) : (
        <button onClick={() => setAdding(true)} className="btn-primary w-full">
          ➕ {t('where.add')}
        </button>
      )}
      <p className="text-[11px] text-tierra-500">{t('where.source')}</p>
    </section>
  )
}

const EMOJIS = ['🌱', '🥬', '🥕', '🧅', '🧄', '🍅', '🫑', '🥒', '🍓', '🍌', '🍍', '🍊', '🍇', '🌾', '🌻', '🍠', '🫛', '🟢', '🟡', '🌺']
const WATER: { key: 'low' | 'mid' | 'high'; mm: number }[] = [
  { key: 'low', mm: 350 },
  { key: 'mid', mm: 600 },
  { key: 'high', mm: 1200 },
]

function AddCropForm({ onSave, onCancel, existing }: { onSave: (c: CustomCropInput) => void; onCancel: () => void; existing: string[] }) {
  const { t, L } = useI18n()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌱')
  const [altMin, setAltMin] = useState('0')
  const [altMax, setAltMax] = useState('3500')
  const [minT, setMinT] = useState('10')
  const [frost, setFrost] = useState(true)
  const [cycle, setCycle] = useState('5')
  const [perennial, setPerennial] = useState(false)
  const [water, setWater] = useState(600)
  const label = 'block text-xs font-extrabold text-tierra-700'
  const field = 'mt-1 block min-h-[44px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-3 text-base font-semibold'

  const applyPreset = (p: (typeof CROP_PRESETS)[number]) => {
    setName(L(p.name))
    setEmoji(p.emoji)
    setAltMin(String(p.altitude[0]))
    setAltMax(String(p.altitude[1]))
    setMinT(String(p.minMeanTemp))
    setFrost(p.frostSensitive)
    setCycle(String(p.cycleMonths))
    setPerennial(p.perennial)
    setWater(p.waterMm)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const lo = Number(altMin)
    const hi = Number(altMax)
    const needs: CropNeeds = {
      altitude: [Math.min(lo, hi), Math.max(lo, hi)],
      minMeanTemp: Number(minT),
      frostSensitive: frost,
      cycleMonths: Math.max(1, Number(cycle) || 1),
      perennial,
      waterMm: water,
    }
    onSave({ name: name.trim(), emoji, ...needs })
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-3xl bg-white p-3 ring-2 ring-good/40">
      <h3 className="font-extrabold text-noche-800">➕ {t('where.addTitle')}</h3>
      <div>
        <p className={label}>{t('where.presets')}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {CROP_PRESETS.filter((p) => !existing.includes(L(p.name).toLowerCase())).map((p) => (
            <button key={p.key} type="button" onClick={() => applyPreset(p)} className="chip border-tierra-200 bg-tierra-50 text-tierra-800">
              {p.emoji} {L(p.name)}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-tierra-600">{t('where.presetsHint')}</p>
      </div>
      <label className={label}>
        {t('where.name')}
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('where.namePh')} maxLength={40} required />
      </label>
      <div>
        <p className={label}>{t('where.emoji')}</p>
        <div className="mt-1 flex flex-wrap gap-1" role="radiogroup" aria-label={t('where.emoji')}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              role="radio"
              aria-checked={emoji === e}
              onClick={() => setEmoji(e)}
              className={`h-10 w-10 rounded-xl text-xl ${emoji === e ? 'bg-noche-800 ring-2 ring-noche-800' : 'bg-tierra-50'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className={label}>
          ⛰️ {t('where.altMin')}
          <input type="number" inputMode="numeric" min={0} max={6000} className={field} value={altMin} onChange={(e) => setAltMin(e.target.value)} required />
        </label>
        <label className={label}>
          ⛰️ {t('where.altMax')}
          <input type="number" inputMode="numeric" min={0} max={6000} className={field} value={altMax} onChange={(e) => setAltMax(e.target.value)} required />
        </label>
        <label className={label}>
          🌡️ {t('where.minT')}
          <input type="number" inputMode="decimal" min={-5} max={35} step="any" className={field} value={minT} onChange={(e) => setMinT(e.target.value)} required />
        </label>
        <label className={label}>
          🗓️ {t('where.cycle')}
          <input type="number" inputMode="numeric" min={1} max={60} className={field} value={cycle} onChange={(e) => setCycle(e.target.value)} required />
        </label>
      </div>
      <div>
        <p className={label}>💧 {t('where.water')}</p>
        <div className="mt-1 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={t('where.water')}>
          {WATER.map((w) => (
            <button
              key={w.key}
              type="button"
              role="radio"
              aria-checked={water === w.mm}
              onClick={() => setWater(w.mm)}
              className={`min-h-[44px] rounded-2xl border-2 text-xs font-bold ${water === w.mm ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
            >
              {t(`where.water.${w.key}` as Key)}
            </button>
          ))}
        </div>
      </div>
      <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-bold text-tierra-800">
        <input type="checkbox" className="h-5 w-5 accent-noche-800" checked={frost} onChange={(e) => setFrost(e.target.checked)} />
        ❄️ {t('where.frostSensitive')}
      </label>
      <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-bold text-tierra-800">
        <input type="checkbox" className="h-5 w-5 accent-noche-800" checked={perennial} onChange={(e) => setPerennial(e.target.checked)} />
        🌳 {t('where.perennial')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">
          {t('hist.cancel')}
        </button>
        <button type="submit" className="btn-primary text-sm">
          ✅ {t('where.saveCrop')}
        </button>
      </div>
    </form>
  )
}

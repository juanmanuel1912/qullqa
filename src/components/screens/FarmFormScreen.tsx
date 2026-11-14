import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import { useMyFarms, type MyFarmInput, type WaterSource } from '@/lib/farms/myFarms'
import { NEXT_CROPS, NEXT_IDS, PREV_IDS, prevEmoji, type NextCropId, type SoilType } from '@/lib/rotation/nextCrop'
import { fetchElevation } from '@/services/weather/openMeteo'
import { PlaceSearch } from '@/components/farm/PlaceSearch'
import { IconGps, Notice, Skeleton } from '@/components/common'

const FarmMap = lazy(() => import('@/components/map/FarmMap'))

const SOILS: { id: SoilType; icon: string }[] = [
  { id: 'loam', icon: '🟫' },
  { id: 'clay', icon: '🧱' },
  { id: 'sandy', icon: '🏜️' },
  { id: 'unknown', icon: '❓' },
]

const round = (n: number) => Math.round(n * 1e4) / 1e4

/** Agregar o editar una chacra del agricultor y lo que produce. */
export default function FarmFormScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useQullqa()
  const { t } = useI18n()
  const { farms, add, update } = useMyFarms()
  const editing = id ? farms.find((f) => f.id === id) : undefined

  const [form, setForm] = useState<MyFarmInput>(
    () =>
      editing ?? {
        name: '',
        placeName: profile.placeName,
        lat: profile.lat,
        lon: profile.lon,
        elevation: null,
        areaHa: null,
        soil: 'unknown',
        water: 'rain',
        products: ['papa'],
        lastCrop: 'papa',
      },
  )
  const [gps, setGps] = useState<'idle' | 'locating' | 'error'>('idle')

  // Altitud exacta del punto inicial (si aún no la tenemos)
  useEffect(() => {
    if (form.elevation != null) return
    const ctrl = new AbortController()
    const { lat, lon } = form
    fetchElevation(lat, lon, ctrl.signal).then((e) => setForm((f) => (f.lat === lat && f.lon === lon && f.elevation == null ? { ...f, elevation: e } : f)))
    return () => ctrl.abort()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setPlace = (lat: number, lon: number, placeName: string, elevation: number | null = null) => {
    setForm((f) => ({ ...f, lat: round(lat), lon: round(lon), placeName, elevation }))
    if (elevation == null) fetchElevation(lat, lon).then((e) => setForm((f) => (f.lat === round(lat) && f.lon === round(lon) ? { ...f, elevation: e } : f)))
  }

  const locate = () => {
    if (!navigator.geolocation) return setGps('error')
    setGps('locating')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPlace(p.coords.latitude, p.coords.longitude, t('farm.gpsName'))
        setGps('idle')
      },
      () => setGps('error'),
      { timeout: 10_000, maximumAge: 600_000 },
    )
  }

  const toggleProduct = (c: NextCropId) =>
    setForm((f) => ({ ...f, products: f.products.includes(c) ? f.products.filter((x) => x !== c) : [...f.products, c] }))

  const valid = form.name.trim().length >= 2
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const data = { ...form, name: form.name.trim() }
    if (editing) {
      update(editing.id, data)
      navigate(`/mis-chacras/${editing.id}`)
    } else {
      navigate(`/mis-chacras/${add(data)}`)
    }
  }

  const chip = (active: boolean) => `chip ${active ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`
  const label = 'block text-sm font-extrabold text-tierra-700'
  const field = 'mt-1 block min-h-[48px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base font-semibold'

  return (
    <form onSubmit={submit} className="space-y-4">
      <header className="pt-2">
        <h1 className="font-display text-3xl text-noche-800">{editing ? t('myf.editTitle') : t('myf.addTitle')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('myf.addSubtitle')}</p>
      </header>

      {/* Nombre y área */}
      <section className="card space-y-3">
        <label className={label}>
          {t('myf.name')}
          <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('myf.namePh')} maxLength={60} required />
        </label>
        <label className={label}>
          {t('myf.area')}
          <input
            className={field}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            value={form.areaHa ?? ''}
            onChange={(e) => setForm({ ...form, areaHa: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) })}
            placeholder="1.5"
          />
        </label>
      </section>

      {/* Ubicación */}
      <section className="card space-y-3">
        <h2 className="text-lg font-extrabold">📍 {t('myf.where')}</h2>
        <p className="rounded-2xl bg-tierra-50 p-3 text-sm font-bold text-tierra-800">
          {form.placeName} · {form.lat.toFixed(3)}, {form.lon.toFixed(3)}
          {form.elevation != null && <> · ⛰️ {form.elevation.toLocaleString()} m</>}
        </p>
        <button type="button" onClick={locate} className="btn-dark w-full" disabled={gps === 'locating'}>
          <IconGps size={20} /> {gps === 'locating' ? t('farm.locating') : t('farm.gps')}
        </button>
        {gps === 'error' && <Notice tone="warning">{t('farm.gpsError')}</Notice>}
        <PlaceSearch onPick={(p) => setPlace(p.lat, p.lon, p.name, p.elevation != null ? Math.round(p.elevation) : null)} />
        <Suspense fallback={<Skeleton className="h-56" />}>
          <FarmMap lat={form.lat} lon={form.lon} onPick={(lat, lon) => setPlace(lat, lon, t('farm.mapPoint'))} />
        </Suspense>
        <p className="text-xs text-tierra-600">{t('farm.mapHint')}</p>
      </section>

      {/* Tierra y agua */}
      <section className="card space-y-3">
        <h2 className="text-lg font-extrabold">🟤 {t('myf.soil')}</h2>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('myf.soil')}>
          {SOILS.map((s) => (
            <button
              type="button"
              key={s.id}
              role="radio"
              aria-checked={form.soil === s.id}
              onClick={() => setForm({ ...form, soil: s.id })}
              className={`rounded-2xl border-2 p-3 text-left transition ${form.soil === s.id ? 'border-noche-800 bg-noche-50' : 'border-tierra-200 bg-white'}`}
            >
              <span className="block font-extrabold">
                {s.icon} {t(`soil.${s.id}` as Key)}
              </span>
              <span className="block text-xs text-tierra-700">{t(`soil.${s.id}.hint` as Key)}</span>
            </button>
          ))}
        </div>
        <h2 className="pt-1 text-lg font-extrabold">💧 {t('myf.water')}</h2>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('myf.water')}>
          {(['rain', 'irrigation'] as WaterSource[]).map((w) => (
            <button type="button" key={w} role="radio" aria-checked={form.water === w} onClick={() => setForm({ ...form, water: w })} className={`${chip(form.water === w)} justify-center`}>
              {w === 'rain' ? '🌧️' : '🚿'} {t(`water.${w}` as Key)}
            </button>
          ))}
        </div>
      </section>

      {/* Productos */}
      <section className="card space-y-3">
        <div>
          <h2 className="text-lg font-extrabold">🧺 {t('myf.products')}</h2>
          <p className="text-sm text-tierra-700">{t('myf.productsHint')}</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {NEXT_IDS.map((c) => {
            const on = form.products.includes(c)
            return (
              <button
                type="button"
                key={c}
                aria-pressed={on}
                onClick={() => toggleProduct(c)}
                className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl border-2 px-1 py-1.5 text-center text-[11px] font-bold leading-tight transition ${
                  on ? 'border-good bg-green-50 text-green-900' : 'border-tierra-200 bg-white text-tierra-800'
                }`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {NEXT_CROPS[c].emoji}
                </span>
                {on && '✓ '}
                {t(`rotcrop.${c}` as Key)}
              </button>
            )
          })}
        </div>
        <h2 className="pt-1 text-lg font-extrabold">🔁 {t('myf.last')}</h2>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={t('myf.last')}>
          {PREV_IDS.map((c) => (
            <button type="button" key={c} role="radio" aria-checked={form.lastCrop === c} onClick={() => setForm({ ...form, lastCrop: c })} className={`${chip(form.lastCrop === c)} shrink-0`}>
              {prevEmoji(c)} {t(`rotcrop.${c}` as Key)}
            </button>
          ))}
        </div>
      </section>

      <Notice tone="info">{t('myf.demo')}</Notice>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => navigate(-1)} className="btn-ghost">
          {t('prod.cancel')}
        </button>
        <button type="submit" disabled={!valid} className="btn-primary">
          {t('myf.save')}
        </button>
      </div>
    </form>
  )
}

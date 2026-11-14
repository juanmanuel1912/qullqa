import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { useMyFarms } from '@/lib/farms/myFarms'
import {
  aYearAgo,
  exampleRecords,
  isoDate,
  previousSameCrop,
  recordProgress,
  sortRecords,
  summaryByYear,
  useHistory,
  yieldTHa,
  type FieldRecord,
  type HarvestQuality,
} from '@/lib/farms/history'
import { NEXT_CROPS, NEXT_IDS, type NextCropId } from '@/lib/rotation/nextCrop'
import { Attribution, Notice } from '@/components/common'

const label = 'block text-sm font-extrabold text-tierra-700'
const field = 'mt-1 block min-h-[48px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base font-semibold'
const QUALITY: Record<HarvestQuality, string> = { good: '😀', normal: '😐', bad: '😟' }

/** Historial de siembra y cosecha: qué sembré, cuándo, cuánto coseché. */
export default function HistoryScreen() {
  const { t, fmtLong } = useI18n()
  const [params, setParams] = useSearchParams()
  const { farms, update: updateFarm } = useMyFarms()
  const { records, add, update, remove } = useHistory()
  const today = isoDate(new Date())
  const farmFilter = params.get('chacra')
  const [adding, setAdding] = useState(false)

  const mine = useMemo(() => records.filter((r) => !farmFilter || r.farmId === farmFilter), [records, farmFilter])
  const sorted = useMemo(() => sortRecords(mine), [mine])
  const growing = sorted.filter((r) => !r.harvestDate)
  const yearAgo = useMemo(() => aYearAgo(mine, today), [mine, today])
  const years = useMemo(() => summaryByYear(mine), [mine])
  // Cosechas de este año (por fecha de cosecha, no de siembra)
  const harvestedThisYear = mine.filter((r) => r.harvestDate?.startsWith(today.slice(0, 4)))
  const kgThisYear = harvestedThisYear.reduce((s, r) => s + (r.yieldKg ?? 0), 0)
  const farmName = (id: string | null) => farms.find((f) => f.id === id)?.name ?? null

  /** Al cosechar, la chacra recuerda lo último sembrado (para la rotación) */
  const harvest = (r: FieldRecord, patch: Pick<FieldRecord, 'harvestDate' | 'yieldKg' | 'quality' | 'notes'>) => {
    update(r.id, patch)
    if (r.farmId && farms.some((f) => f.id === r.farmId)) updateFarm(r.farmId, { lastCrop: r.crop })
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">📒 {t('hist.eyebrow')}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('hist.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('hist.subtitle')}</p>
      </header>

      {farms.length > 0 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={t('hist.farm')}>
          {[{ id: null as string | null, name: t('hist.allFarms') }, ...farms.map((f) => ({ id: f.id as string | null, name: f.name }))].map((f) => (
            <button
              key={f.id ?? 'all'}
              role="radio"
              aria-checked={farmFilter === f.id}
              onClick={() => setParams(f.id ? { chacra: f.id } : {}, { replace: true })}
              className={`chip shrink-0 ${farmFilter === f.id ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
            >
              {f.id ? '🌾' : '📒'} {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat value={growing.length} label={t('hist.stat.growing')} />
        <Stat value={harvestedThisYear.length} label={t('hist.stat.harvests', { year: today.slice(0, 4) })} />
        <Stat value={`${(kgThisYear / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} t`} label={t('hist.stat.kg')} />
      </div>

      {adding ? (
        <AddForm
          defaultFarm={farmFilter}
          onCancel={() => setAdding(false)}
          onSave={(r) => {
            add(r)
            if (r.harvestDate && r.farmId) updateFarm(r.farmId, { lastCrop: r.crop })
            setAdding(false)
          }}
        />
      ) : (
        <button onClick={() => setAdding(true)} className="btn-primary w-full">
          ➕ {t('hist.add')}
        </button>
      )}

      {records.length === 0 && !adding && (
        <section className="card space-y-2 text-center">
          <p className="text-4xl" aria-hidden="true">
            📒
          </p>
          <p className="font-extrabold">{t('hist.emptyTitle')}</p>
          <p className="text-sm text-tierra-700">{t('hist.emptyText')}</p>
          <button onClick={() => add(...exampleRecords(today))} className="btn-ghost w-full text-sm">
            👀 {t('hist.loadExample')}
          </button>
        </section>
      )}

      {/* Hace un año */}
      {mine.length > 0 && (
        <section className="card space-y-2 ring-2 ring-inti-200">
          <h2 className="text-lg font-extrabold">🗓️ {t('hist.yearAgo')}</h2>
          {yearAgo.length === 0 ? (
            <p className="text-sm text-tierra-700">{t('hist.yearAgoNone')}</p>
          ) : (
            <ul className="space-y-1.5">
              {yearAgo.map((r) => (
                <li key={r.id} className="rounded-2xl bg-inti-50 p-3 text-sm text-tierra-900">
                  {NEXT_CROPS[r.crop].emoji}{' '}
                  {t('hist.yearAgoItem', { crop: t(`rotcrop.${r.crop}` as Key), date: fmtLong(r.sowDate) })}
                  {r.harvestDate && <> {t('hist.yearAgoHarvest', { date: fmtLong(r.harvestDate), kg: r.yieldKg?.toLocaleString() ?? '—' })}</>}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-tierra-600">💡 {t('hist.yearAgoTip')}</p>
        </section>
      )}

      {/* En la chacra ahora */}
      {growing.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-noche-800">🌱 {t('hist.now')}</h2>
          {growing.map((r) => (
            <GrowingCard key={r.id} record={r} today={today} farm={farmName(r.farmId)} onHarvest={(p) => harvest(r, p)} onDelete={() => remove(r.id)} />
          ))}
        </section>
      )}

      {/* Lo que pasó, por año */}
      {years.map((y) => {
        const items = sorted.filter((r) => r.sowDate.startsWith(String(y.year)) && r.harvestDate)
        if (items.length === 0) return null
        return (
          <section key={y.year} className="space-y-2">
            <h2 className="font-display text-xl text-noche-800">
              📅 {y.year}{' '}
              <span className="text-sm font-bold text-tierra-500">
                · {t('hist.yearSummary', { n: y.harvested, t: (y.kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) })}
              </span>
            </h2>
            <ul className="space-y-2">
              {items.map((r) => (
                <HarvestedItem key={r.id} record={r} prev={previousSameCrop(records, r)} farm={farmName(r.farmId)} onDelete={() => remove(r.id)} />
              ))}
            </ul>
          </section>
        )
      })}

      <Link to="/planes" className="card flex items-center gap-3 p-4">
        <span className="text-2xl" aria-hidden="true">
          📋
        </span>
        <span className="flex-1">
          <span className="block font-extrabold">{t('plans.title')}</span>
          <span className="text-sm text-tierra-700">{t('plans.linkText')}</span>
        </span>
      </Link>
      {mine.length > 0 && (
        <Link to="/rotacion" className="btn-ghost w-full text-sm">
          🔄 {t('hist.toRotation')}
        </Link>
      )}
      <Notice tone="info">{t('hist.note')}</Notice>
      <Attribution />
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-card">
      <p className="text-2xl font-extrabold text-noche-800">{value}</p>
      <p className="text-[11px] font-bold leading-tight text-tierra-600">{label}</p>
    </div>
  )
}

function GrowingCard({
  record: r,
  today,
  farm,
  onHarvest,
  onDelete,
}: {
  record: FieldRecord
  today: string
  farm: string | null
  onHarvest: (p: Pick<FieldRecord, 'harvestDate' | 'yieldKg' | 'quality' | 'notes'>) => void
  onDelete: () => void
}) {
  const { t, fmtLong } = useI18n()
  const p = recordProgress(r, today)
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(today)
  const [kg, setKg] = useState('')
  const [quality, setQuality] = useState<HarvestQuality>('normal')
  const [notes, setNotes] = useState(r.notes)
  const perennial = NEXT_CROPS[r.crop].perennial

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onHarvest({ harvestDate: date, yieldKg: kg ? Number(kg) : null, quality, notes })
  }

  return (
    <article className="card space-y-2">
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">
          {NEXT_CROPS[r.crop].emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold">
            {t(`rotcrop.${r.crop}` as Key)}
            {r.areaHa != null && <span className="text-sm font-bold text-tierra-500"> · {r.areaHa} ha</span>}
          </p>
          <p className="text-xs text-tierra-600">
            {farm && <>🌾 {farm} · </>}
            {t('hist.sownOn', { date: fmtLong(r.sowDate), n: p.days })}
          </p>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-tierra-100" role="progressbar" aria-valuenow={Math.round(p.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${p.status === 'ready' ? 'bg-inti-500' : 'bg-good'}`} style={{ width: `${Math.max(4, p.progress * 100)}%` }} />
      </div>
      <p className="text-sm text-tierra-800">
        {p.status === 'ready'
          ? `🧺 ${t('hist.ready', { date: fmtLong(p.expected) })}`
          : `⏳ ${t(perennial ? 'hist.firstHarvest' : 'hist.expected', { date: fmtLong(p.expected), n: p.daysLeft })}`}
      </p>
      {r.notes && <p className="text-xs italic text-tierra-600">📝 {r.notes}</p>}

      {open ? (
        <form onSubmit={submit} className="space-y-3 rounded-2xl bg-green-50 p-3">
          <label className={label}>
            {t('hist.harvestDate')}
            <input type="date" className={field} value={date} min={r.sowDate} max={today} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className={label}>
            {t('hist.kg')}
            <input type="number" inputMode="decimal" min={0} step="any" className={field} value={kg} onChange={(e) => setKg(e.target.value)} placeholder="1200" />
          </label>
          <QualityPicker value={quality} onChange={setQuality} />
          <label className={label}>
            {t('hist.notes')}
            <input className={field} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('hist.notesPh')} maxLength={140} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-sm">
              {t('hist.cancel')}
            </button>
            <button type="submit" className="btn-primary text-sm">
              ✅ {t('hist.save')}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="btn-dark min-h-[40px] flex-1 px-4 text-sm">
            🧺 {t('hist.registerHarvest')}
          </button>
          <DeleteButton onDelete={onDelete} />
        </div>
      )}
    </article>
  )
}

function HarvestedItem({ record: r, prev, farm, onDelete }: { record: FieldRecord; prev: FieldRecord | null; farm: string | null; onDelete: () => void }) {
  const { t, fmtShort } = useI18n()
  const tha = yieldTHa(r)
  const diff = prev?.yieldKg && r.yieldKg && prev.areaHa && r.areaHa ? Math.round(((r.yieldKg / r.areaHa / (prev.yieldKg / prev.areaHa)) - 1) * 100) : null
  const p = recordProgress(r, r.harvestDate!)
  return (
    <li className="card flex items-start gap-3 p-3">
      <span className="text-2xl" aria-hidden="true">
        {NEXT_CROPS[r.crop].emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">
          {t(`rotcrop.${r.crop}` as Key)} {r.quality && <span aria-label={t(`hist.q.${r.quality}` as Key)}>{QUALITY[r.quality]}</span>}
        </p>
        <p className="text-xs text-tierra-600">
          {farm && <>🌾 {farm} · </>}
          {fmtShort(r.sowDate)} → {fmtShort(r.harvestDate!)} · {t('hist.days', { n: p.days })}
        </p>
        <p className="mt-0.5 text-sm font-bold text-noche-800">
          {r.yieldKg != null ? `${r.yieldKg.toLocaleString()} kg` : '—'}
          {r.areaHa != null && <span className="font-semibold text-tierra-600"> · {r.areaHa} ha</span>}
          {tha != null && <span className="font-semibold text-tierra-600"> · {tha} t/ha</span>}
        </p>
        {diff != null && (
          <p className={`text-xs font-bold ${diff >= 0 ? 'text-good' : 'text-risk'}`}>
            {diff >= 0 ? '📈' : '📉'} {t(diff >= 0 ? 'hist.better' : 'hist.worse', { p: Math.abs(diff), year: prev!.sowDate.slice(0, 4) })}
          </p>
        )}
        {r.notes && <p className="text-xs italic text-tierra-600">📝 {r.notes}</p>}
      </div>
      <DeleteButton onDelete={onDelete} />
    </li>
  )
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const { t } = useI18n()
  return (
    <button
      onClick={() => window.confirm(t('hist.confirmDelete')) && onDelete()}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-tierra-400 hover:bg-tierra-100"
      aria-label={t('hist.delete')}
      title={t('hist.delete')}
    >
      🗑️
    </button>
  )
}

function QualityPicker({ value, onChange }: { value: HarvestQuality; onChange: (q: HarvestQuality) => void }) {
  const { t } = useI18n()
  return (
    <div>
      <p className={label}>{t('hist.quality')}</p>
      <div className="mt-1 grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('hist.quality')}>
        {(['good', 'normal', 'bad'] as const).map((q) => (
          <button
            key={q}
            type="button"
            role="radio"
            aria-checked={value === q}
            onClick={() => onChange(q)}
            className={`min-h-[44px] rounded-2xl border-2 text-sm font-bold ${value === q ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
          >
            {QUALITY[q]} {t(`hist.q.${q}` as Key)}
          </button>
        ))}
      </div>
    </div>
  )
}

function AddForm({
  defaultFarm,
  onSave,
  onCancel,
}: {
  defaultFarm: string | null
  onSave: (r: Omit<FieldRecord, 'id'>) => void
  onCancel: () => void
}) {
  const { t } = useI18n()
  const { farms } = useMyFarms()
  const today = isoDate(new Date())
  const [crop, setCrop] = useState<NextCropId>('papa')
  const [farmId, setFarmId] = useState<string>(defaultFarm ?? farms[0]?.id ?? '')
  const [sowDate, setSowDate] = useState(today)
  const [area, setArea] = useState('')
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)
  const [harvestDate, setHarvestDate] = useState(today)
  const [kg, setKg] = useState('')
  const [quality, setQuality] = useState<HarvestQuality>('normal')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave({
      farmId: farmId || null,
      crop,
      sowDate,
      areaHa: area ? Number(area) : null,
      harvestDate: done ? harvestDate : null,
      yieldKg: done && kg ? Number(kg) : null,
      quality: done ? quality : null,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={submit} className="card space-y-4 ring-2 ring-good/40">
      <h2 className="text-lg font-extrabold">🌱 {t('hist.newTitle')}</h2>
      <div>
        <p className={label}>{t('hist.crop')}</p>
        <div className="mt-1 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={t('hist.crop')}>
          {NEXT_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={crop === id}
              onClick={() => setCrop(id)}
              className={`min-h-[44px] rounded-2xl border-2 px-1 text-xs font-bold ${crop === id ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
            >
              {NEXT_CROPS[id].emoji} {t(`rotcrop.${id}` as Key)}
            </button>
          ))}
        </div>
      </div>
      <label className={label}>
        {t('hist.farm')}
        <select className={field} value={farmId} onChange={(e) => setFarmId(e.target.value)}>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
          <option value="">{t('hist.noFarm')}</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className={label}>
          {t('hist.sowDate')}
          <input type="date" className={field} value={sowDate} max={today} onChange={(e) => setSowDate(e.target.value)} required />
        </label>
        <label className={label}>
          {t('hist.area')}
          <input type="number" inputMode="decimal" min={0} step="any" className={field} value={area} onChange={(e) => setArea(e.target.value)} placeholder="0.5" />
        </label>
      </div>
      <label className={label}>
        {t('hist.notes')}
        <input className={field} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('hist.notesPh')} maxLength={140} />
      </label>

      <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-bold text-tierra-800">
        <input type="checkbox" className="h-5 w-5 accent-noche-800" checked={done} onChange={(e) => setDone(e.target.checked)} />
        🧺 {t('hist.alreadyHarvested')}
      </label>
      {done && (
        <div className="space-y-3 rounded-2xl bg-green-50 p-3">
          <div className="grid grid-cols-2 gap-2">
            <label className={label}>
              {t('hist.harvestDate')}
              <input type="date" className={field} value={harvestDate} min={sowDate} max={today} onChange={(e) => setHarvestDate(e.target.value)} required />
            </label>
            <label className={label}>
              {t('hist.kg')}
              <input type="number" inputMode="decimal" min={0} step="any" className={field} value={kg} onChange={(e) => setKg(e.target.value)} placeholder="1200" />
            </label>
          </div>
          <QualityPicker value={quality} onChange={setQuality} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">
          {t('hist.cancel')}
        </button>
        <button type="submit" className="btn-primary text-sm">
          ✅ {t('hist.save')}
        </button>
      </div>
    </form>
  )
}

import { useState, type FormEvent } from 'react'
import { useI18n } from '@/i18n'
import { CROPS, cropById, type CropId } from '@/lib/crops/catalog'
import { useProducts, type ProductInput } from '@/lib/farms/products'
import { Notice, ShareButtons } from '@/components/common'
import { DEMO_FARMER } from '@/lib/farms/demo'

const EMPTY: ProductInput = { name: '', crop: 'papa', variety: '', amount: '', fromMonth: 3, toMonth: 5, notes: '' }

/** "Mis productos": el agricultor agrega lo que ofrece (demo local, base del futuro marketplace). */
export function MyProducts() {
  const { t, L, month } = useI18n()
  const { items, add, remove } = useProducts()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ProductInput>(EMPTY)
  const [saved, setSaved] = useState(false)

  const field = 'mt-1 block min-h-[44px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-3 text-base'
  const label = 'block text-sm font-semibold text-tierra-700'
  const valid = form.name.trim().length > 1

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    add({ ...form, name: form.name.trim() })
    setForm(EMPTY)
    setOpen(false)
    setSaved(true)
  }

  const monthSelect = (value: number, onChange: (m: number) => void) => (
    <select className={field} value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {Array.from({ length: 12 }, (_, m) => (
        <option key={m} value={m}>
          {month(m)}
        </option>
      ))}
    </select>
  )

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-extrabold">{t('prod.title')}</h2>
        <p className="text-sm text-tierra-700">{t('prod.subtitle')}</p>
      </div>
      <Notice tone="info">{t('prod.demo')}</Notice>
      {saved && <Notice tone="success">{t('prod.saved')}</Notice>}

      {items.map((p) => {
        const crop = cropById(p.crop)
        return (
          <article key={p.id} className="card flex items-center gap-3 p-4 ring-2 ring-inti-200">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `${crop.color}33` }} aria-hidden="true">
              {crop.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{p.name}</p>
              <p className="text-xs text-tierra-600">
                {L(crop.name)}
                {p.variety && ` · ${p.variety}`}
                {p.amount && ` · ${p.amount}`}
              </p>
              <p className="mt-1 inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-800">
                📅 {t('prod.available', { from: month(p.fromMonth), to: month(p.toMonth) })}
              </p>
              {p.notes && <p className="mt-1 text-xs text-tierra-700">{p.notes}</p>}
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-inti-800">{t('prod.mine')}</p>
              <div className="mt-2">
                <ShareButtons
                  compact
                  path="/perfil"
                  text={t('share.productText', {
                    product: `${p.name}${p.variety ? ` (${p.variety})` : ''}`,
                    place: DEMO_FARMER.place,
                    when: t('prod.available', { from: month(p.fromMonth), to: month(p.toMonth) }),
                    name: DEMO_FARMER.name,
                  })}
                />
              </div>
            </div>
            <button onClick={() => remove(p.id)} className="shrink-0 text-xs font-bold text-tierra-500 underline">
              {t('prod.remove')}
            </button>
          </article>
        )
      })}

      {open ? (
        <form onSubmit={submit} className="card space-y-3">
          <label className={label}>
            {t('prod.name')}
            <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} required />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className={label}>
              {t('prod.crop')}
              <select className={field} value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value as CropId })}>
                {CROPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {L(c.name)}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              {t('prod.variety')}
              <input className={field} value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} maxLength={60} />
            </label>
          </div>
          <label className={label}>
            {t('prod.amount')}
            <input className={field} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} maxLength={40} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className={label}>
              {t('prod.from')}
              {monthSelect(form.fromMonth, (m) => setForm({ ...form, fromMonth: m }))}
            </label>
            <label className={label}>
              {t('prod.to')}
              {monthSelect(form.toMonth, (m) => setForm({ ...form, toMonth: m }))}
            </label>
          </div>
          <label className={label}>
            {t('prod.notes')}
            <textarea className={`${field} min-h-[72px] py-2`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={300} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              {t('prod.cancel')}
            </button>
            <button type="submit" disabled={!valid} className="btn-primary">
              {t('prod.save')}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setOpen(true)
            setSaved(false)
          }}
          className="btn-dark w-full"
        >
          ＋ {t('prod.add')}
        </button>
      )}
    </section>
  )
}

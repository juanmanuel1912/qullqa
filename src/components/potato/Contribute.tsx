import { useState, type FormEvent } from 'react'
import { useI18n, type Key } from '@/i18n'
import { resizePhoto, useContributions, type ContribStatus, type ContributionInput } from '@/lib/potato/contributions'
import { Notice } from '@/components/common'
import { POTATOES } from '@/lib/potato/catalog'

const EMPTY: ContributionInput = {
  name: '',
  localNames: '',
  where: '',
  altitude: '',
  dishes: '',
  diseases: '',
  description: '',
  photo: null,
  author: '',
}

const STATUS_STYLE: Record<ContribStatus, string> = {
  pending: 'bg-inti-100 text-inti-900',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-50 text-red-700',
}

export function Contribute() {
  const { t } = useI18n()
  const { items, add, setStatus, approved } = useContributions()
  const documented = POTATOES.length + approved.length
  const [form, setForm] = useState<ContributionInput>(EMPTY)
  const [sent, setSent] = useState(false)
  const [reviewer, setReviewer] = useState(false)
  const set = (k: keyof ContributionInput) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })
  const valid = form.name.trim().length > 1 && form.where.trim().length > 1

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    add({ ...form, name: form.name.trim(), where: form.where.trim() })
    setForm(EMPTY)
    setSent(true)
  }

  const field = 'mt-1 block min-h-[48px] w-full rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base'
  const label = 'block text-sm font-semibold text-tierra-700'

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-noche-800 p-5 text-white">
        <p className="font-display text-xl">{t('contrib.title')}</p>
        <p className="mt-1 text-sm text-noche-100">{t('contrib.intro')}</p>
      </div>
      {/* Cómo funcionará (ejemplo) */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg">{t('cflow.title')}</h3>
          <span className="shrink-0 rounded-full bg-inti-100 px-2.5 py-1 text-xs font-bold text-inti-900">{t('cflow.soon')}</span>
        </div>
        <ol className="space-y-3">
          {(['🧑‍🌾', '🔎', '✅'] as const).map((icon, i) => (
            <li key={icon} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-tierra-100 text-xl" aria-hidden="true">
                {icon}
              </span>
              <div>
                <p className="font-extrabold">
                  {i + 1}. {t(`cflow.${i + 1}.title` as Key)}
                </p>
                <p className="text-sm text-tierra-800">{t(`cflow.${i + 1}.text` as Key)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-tierra-200 p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-good font-extrabold text-white">AR</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-tierra-500">{t('cflow.approver')}</p>
            <p className="font-extrabold">Ing. Amaru Rojas</p>
            <p className="text-xs text-tierra-700">{t('cflow.approverRole')}</p>
          </div>
        </div>
        <div>
          <div className="h-3 overflow-hidden rounded-full bg-tierra-100">
            <div className="h-full rounded-full bg-good" style={{ width: `${Math.max(1, (documented / 3000) * 100)}%` }} />
          </div>
          <p className="mt-1 text-xs font-bold text-tierra-700">{t('cflow.goal', { n: documented })}</p>
        </div>
      </div>

      <Notice tone="info">{t('contrib.demoNote')}</Notice>

      {sent && <Notice tone="success">{t('contrib.sent')}</Notice>}

      <form onSubmit={submit} className="card space-y-3">
        <label className={label}>
          {t('contrib.name')}
          <input className={field} value={form.name} onChange={set('name')} required maxLength={80} />
        </label>
        <label className={label}>
          {t('contrib.localNames')}
          <input className={field} value={form.localNames} onChange={set('localNames')} maxLength={120} />
        </label>
        <label className={label}>
          {t('contrib.where')}
          <input className={field} value={form.where} onChange={set('where')} required maxLength={120} />
        </label>
        <label className={label}>
          {t('contrib.altitude')}
          <input className={field} value={form.altitude} onChange={set('altitude')} inputMode="numeric" maxLength={12} />
        </label>
        <label className={label}>
          {t('contrib.dishes')}
          <input className={field} value={form.dishes} onChange={set('dishes')} maxLength={160} />
        </label>
        <label className={label}>
          {t('contrib.diseases')}
          <input className={field} value={form.diseases} onChange={set('diseases')} placeholder={t('contrib.diseasesPh')} maxLength={160} />
        </label>
        <label className={label}>
          {t('contrib.description')}
          <textarea className={`${field} min-h-[96px] py-3`} value={form.description} onChange={set('description')} maxLength={600} />
        </label>
        <div className={label}>
          {t('contrib.photo')}
          {form.photo ? (
            <div className="mt-2 flex items-center gap-3">
              <img src={form.photo} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              <button type="button" onClick={() => setForm({ ...form, photo: null })} className="text-sm font-bold text-tierra-600 underline">
                {t('contrib.removePhoto')}
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-inti-200 file:px-4 file:py-2 file:font-bold"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) setForm({ ...form, photo: await resizePhoto(file).catch(() => null) })
              }}
            />
          )}
        </div>
        <label className={label}>
          {t('contrib.author')}
          <input className={field} value={form.author} onChange={set('author')} maxLength={60} />
        </label>
        <button type="submit" disabled={!valid} className="btn-primary w-full">
          {t('contrib.send')}
        </button>
      </form>

      {/* Lista y revisión */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold">{t('contrib.list')}</h3>
        <label className="flex items-center gap-2 text-sm font-bold text-tierra-700">
          <input type="checkbox" checked={reviewer} onChange={(e) => setReviewer(e.target.checked)} className="h-5 w-5 accent-noche-800" />
          {t('contrib.reviewer')}
        </label>
      </div>
      {items.length === 0 && <p className="text-sm text-tierra-600">{t('contrib.empty')}</p>}
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="card space-y-2 p-4">
            <div className="flex gap-3">
              {c.photo ? (
                <img src={c.photo} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-tierra-100 text-3xl" aria-hidden="true">
                  🥔
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-extrabold leading-tight">{c.name}</p>
                <p className="text-sm text-tierra-700">
                  {c.where}
                  {c.altitude && ` · ${c.altitude} m`}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[c.status]}`}>
                  {t(`contrib.status.${c.status}` as Key)}
                </span>
                {c.example && <span className="ml-1 inline-block rounded-full bg-tierra-100 px-2.5 py-0.5 text-xs font-bold">{t('contrib.example')}</span>}
              </div>
            </div>
            {(c.dishes || c.diseases || c.description) && (
              <p className="text-sm text-tierra-800">{[c.dishes, c.diseases, c.description].filter((x) => x && x !== '—').join(' · ')}</p>
            )}
            {c.author && <p className="text-xs text-tierra-500">{t('contrib.by', { name: c.author })}</p>}
            {reviewer && c.status === 'pending' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => setStatus(c.id, 'approved')} className="btn min-h-[40px] bg-good text-sm text-white">
                  ✓ {t('contrib.approve')}
                </button>
                <button onClick={() => setStatus(c.id, 'rejected')} className="btn-ghost min-h-[40px] text-sm">
                  ✕ {t('contrib.reject')}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

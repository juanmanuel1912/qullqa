import { Link } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { addDays, cycleDays, daysBetween, isoDate, useHistory } from '@/lib/farms/history'
import { loadMyFarms } from '@/lib/farms/myFarms'
import { examplePlan, stepSowDate, usePlans, type SavedPlan } from '@/lib/farms/savedPlans'
import { PlanCard } from '@/components/plans/PlanCard'
import { Attribution, Notice } from '@/components/common'

/** Mis planes de siembra: lo que decidí en el planificador, listo para ponerlo en acción. */
export default function PlansScreen() {
  const { t, month } = useI18n()
  const { plans, updateStep, remove } = usePlans()
  const { add } = useHistory()
  const today = isoDate(new Date())

  /** "Ya sembré": queda en el historial y el plan avanza al siguiente paso */
  const sown = (p: SavedPlan, index: number) => {
    const s = p.steps[index]
    // Si siembra mucho antes de lo planeado, confirmar
    if (daysBetween(today, stepSowDate(s)) > 30 && !window.confirm(t('plans.earlyConfirm', { crop: t(`rotcrop.${s.crop}` as Key), when: `${month(s.sowMonth)} ${s.sowYear}` }))) return
    const farm = p.farmId ? loadMyFarms().find((f) => f.id === p.farmId) : undefined
    const id = add({ farmId: p.farmId, crop: s.crop, sowDate: today, areaHa: farm?.areaHa ?? null, harvestDate: null, yieldKg: null, quality: null, notes: t('plans.fromPlan', { name: p.name }) })
    updateStep(p.id, index, { doneDate: today, doneRecordId: id, harvestDate: addDays(today, cycleDays(s.crop)) })
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="eyebrow text-inti-700">📋 {t('plans.eyebrow')}</p>
        <h1 className="mt-1 font-display text-3xl text-noche-800">{t('plans.title')}</h1>
        <p className="mt-1 text-[15px] text-tierra-700">{t('plans.subtitle')}</p>
      </header>

      {/* Cómo funciona */}
      <ol className="grid grid-cols-3 gap-2 text-center">
        {[
          ['🔄', t('plans.how.1')],
          ['💾', t('plans.how.2')],
          ['🌱', t('plans.how.3')],
        ].map(([icon, text], i) => (
          <li key={i} className="rounded-2xl bg-white p-2.5 shadow-card">
            <p className="text-2xl" aria-hidden="true">
              {icon}
            </p>
            <p className="text-[11px] font-bold leading-snug text-tierra-800">
              {i + 1}. {text}
            </p>
          </li>
        ))}
      </ol>

      {plans.length === 0 ? (
        <>
          <Notice tone="info">{t('plans.empty')}</Notice>
          <PlanCard plan={examplePlan(today)} />
        </>
      ) : (
        plans.map((p) => <PlanCard key={p.id} plan={p} onSown={(i) => sown(p, i)} onDelete={() => remove(p.id)} />)
      )}

      <Link to="/rotacion" className="btn-primary w-full">
        🔄 {plans.length ? t('plans.newPlan') : t('plans.makeFirst')}
      </Link>
      <Link to="/historial" className="btn-ghost w-full text-sm">
        📒 {t('plans.toHistory')}
      </Link>
      <p className="text-center text-xs text-tierra-500">{t('plans.note')}</p>
      <Attribution />
    </div>
  )
}

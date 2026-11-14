import { Link } from 'react-router-dom'
import { useI18n, type Key } from '@/i18n'
import { NEXT_CROPS } from '@/lib/rotation/nextCrop'
import { isoDate } from '@/lib/farms/history'
import { nextStep, usePlans } from '@/lib/farms/savedPlans'
import { IconArrow } from '@/components/common'

/** En Inicio: la próxima siembra de mi plan guardado (o una invitación a planificar). */
export function NextPlanCard() {
  const { t, month } = useI18n()
  const { plans } = usePlans()
  const today = isoDate(new Date())
  const next = plans.map((p) => ({ p, n: nextStep(p, today) })).find((x) => x.n)

  if (!next?.n) {
    return (
      <Link to="/planes" className="card flex items-center gap-4 py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-noche-50 text-2xl" aria-hidden="true">
          📋
        </span>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t('plans.title')}</p>
          <p className="mt-0.5 text-sm text-tierra-700">{t('plans.homeText')}</p>
        </div>
        <IconArrow className="shrink-0 text-tierra-500" />
      </Link>
    )
  }
  const { p, n } = next
  return (
    <Link to="/planes" className="card flex items-center gap-4 py-4 ring-2 ring-good/50">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl" aria-hidden="true">
        {NEXT_CROPS[n.step.crop].emoji}
      </span>
      <div className="flex-1">
        <p className="eyebrow text-good">📋 {p.name}</p>
        <p className="font-display text-lg leading-tight">
          {t('plans.sowCrop', { crop: t(`rotcrop.${n.step.crop}` as Key), when: `${month(n.step.sowMonth)} ${n.step.sowYear}` })}
        </p>
        <p className="text-sm text-tierra-700">{n.status === 'now' ? t('plans.isTime') : n.status === 'late' ? t('plans.late') : t('plans.daysLeft', { n: n.daysUntil })}</p>
      </div>
      <IconArrow className="shrink-0 text-tierra-500" />
    </Link>
  )
}

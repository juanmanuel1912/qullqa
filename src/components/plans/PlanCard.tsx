import { useI18n, type Key } from '@/i18n'
import { NEXT_CROPS } from '@/lib/rotation/nextCrop'
import { isoDate } from '@/lib/farms/history'
import { nextStep, stepStatus, type SavedPlan, type StepStatus } from '@/lib/farms/savedPlans'
import { ShareButtons } from '@/components/common'

const STATUS_STYLE: Record<StepStatus, string> = {
  done: 'bg-green-100 text-green-900',
  now: 'bg-inti-200 text-inti-900 ring-2 ring-inti-500',
  soon: 'bg-noche-50 text-noche-800 ring-2 ring-noche-300',
  late: 'bg-red-50 text-red-900 ring-2 ring-red-300',
  later: 'bg-white text-tierra-800 ring-1 ring-tierra-200',
}
const STATUS_ICON: Record<StepStatus, string> = { done: '✅', now: '🌱', soon: '⏳', late: '⚠️', later: '📅' }

/** Texto del plan para mandar por WhatsApp */
export function usePlanShareText() {
  const { t, month, fmtLong } = useI18n()
  return (p: SavedPlan) => {
    const name = (c: string) => t(`rotcrop.${c}` as Key)
    const lines = [
      `🌱 ${t('plans.share.title')}`,
      `📍 ${p.name}${p.placeName && p.placeName !== p.name ? ` (${p.placeName})` : ''}${p.elevation ? ` · ${p.elevation.toLocaleString()} m` : ''}`,
    ]
    if (p.current) lines.push(`🌾 ${t('plans.share.now', { crop: `${NEXT_CROPS[p.current.crop].emoji} ${name(p.current.crop)}`, date: fmtLong(p.current.harvestDate) })}`)
    p.steps.forEach((s, i) =>
      lines.push(
        `${['1️⃣', '2️⃣', '3️⃣', '4️⃣'][i] ?? '▶'} ${NEXT_CROPS[s.crop].emoji} ${name(s.crop)}: ${t('plans.share.sow', { when: `${month(s.sowMonth)} ${s.sowYear}` })}${s.doneDate ? ' ✅' : ''}`,
      ),
    )
    if (p.waits.length) lines.push(`⏳ ${t('plans.share.wait', { crops: p.waits.map((w) => `${name(w.crop)} (${w.from})`).join(', ') })}`)
    lines.push(`🛰️ ${t('plans.share.footer')}`)
    return lines.join('\n')
  }
}

export function PlanCard({
  plan,
  onSown,
  onDelete,
}: {
  plan: SavedPlan
  /** Marcar como sembrado el paso indicado */
  onSown?: (index: number) => void
  onDelete?: () => void
}) {
  const { t, month, fmtLong } = useI18n()
  const shareText = usePlanShareText()
  const today = isoDate(new Date())
  const next = nextStep(plan, today)
  const name = (c: string) => t(`rotcrop.${c}` as Key)

  return (
    <article className={`card space-y-3 ${plan.example ? 'ring-2 ring-inti-200' : 'ring-2 ring-good/40'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {plan.example && <p className="eyebrow text-inti-700">👀 {t('plans.exampleTag')}</p>}
          <h3 className="font-display text-xl leading-tight text-noche-800">📋 {plan.name}</h3>
          <p className="text-xs text-tierra-600">
            📍 {plan.placeName}
            {plan.elevation != null && <> · ⛰️ {plan.elevation.toLocaleString()} m</>} · {t('plans.savedOn', { date: fmtLong(plan.createdAt.slice(0, 10)) })}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => window.confirm(t('plans.confirmDelete')) && onDelete()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-tierra-400 hover:bg-tierra-100"
            aria-label={t('plans.delete')}
            title={t('plans.delete')}
          >
            🗑️
          </button>
        )}
      </div>

      {/* Lo próximo que hay que hacer */}
      {next ? (
        <div className={`rounded-2xl p-3 ${STATUS_STYLE[next.status]}`}>
          <p className="text-xs font-extrabold uppercase tracking-wide">{t('plans.nextAction')}</p>
          <p className="mt-0.5 text-lg font-extrabold leading-tight">
            {STATUS_ICON[next.status]} {t('plans.sowCrop', { crop: `${NEXT_CROPS[next.step.crop].emoji} ${name(next.step.crop)}`, when: `${month(next.step.sowMonth)} ${next.step.sowYear}` })}
          </p>
          <p className="text-sm">
            {next.status === 'now'
              ? t('plans.isTime')
              : next.status === 'late'
                ? t('plans.late')
                : t('plans.daysLeft', { n: next.daysUntil })}
          </p>
          {plan.current && next.index === 0 && plan.current.harvestDate > today && (
            <p className="mt-1 text-xs">🧺 {t('plans.firstHarvest', { crop: name(plan.current.crop), date: fmtLong(plan.current.harvestDate) })}</p>
          )}
        </div>
      ) : (
        <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-900">🎉 {t('plans.allDone')}</p>
      )}

      {/* Los pasos */}
      <ol className="space-y-1.5">
        {plan.current && (
          <li className="flex items-center gap-2 rounded-2xl bg-green-50 p-2.5 text-sm text-green-900">
            <span className="text-xl" aria-hidden="true">
              {NEXT_CROPS[plan.current.crop].emoji}
            </span>
            <span className="flex-1">
              <strong>{name(plan.current.crop)}</strong> · {t('plans.growingUntil', { date: fmtLong(plan.current.harvestDate) })}
            </span>
          </li>
        )}
        {plan.steps.map((s, i) => {
          const st = stepStatus(plan, i, today)
          return (
            <li key={`${s.crop}-${i}`} className={`flex items-center gap-2 rounded-2xl p-2.5 text-sm ${STATUS_STYLE[st]}`}>
              <span className="text-xl" aria-hidden="true">
                {NEXT_CROPS[s.crop].emoji}
              </span>
              <span className="min-w-0 flex-1">
                <strong>
                  {i + 1}. {name(s.crop)}
                </strong>{' '}
                · {s.doneDate ? t('plans.sownOn', { date: fmtLong(s.doneDate) }) : t('plans.sowIn', { when: `${month(s.sowMonth)} ${s.sowYear}` })}
                <span className="block text-[11px] opacity-80">{t('plans.harvestAround', { date: fmtLong(s.harvestDate) })}</span>
              </span>
              <span aria-hidden="true">{STATUS_ICON[st]}</span>
            </li>
          )
        })}
      </ol>

      {plan.waits.length > 0 && (
        <p className="rounded-2xl bg-inti-50 p-2.5 text-xs text-inti-900">
          ⏳ {t('plans.waits', { crops: plan.waits.map((w) => `${NEXT_CROPS[w.crop].emoji} ${name(w.crop)} (${w.from})`).join(', ') })}
        </p>
      )}

      {next && onSown && !plan.example && (
        <button onClick={() => onSown(next.index)} className="btn-dark w-full text-sm">
          🌱 {t('plans.markSown', { crop: name(next.step.crop) })}
        </button>
      )}
      {next && plan.example && <p className="text-xs text-tierra-600">💡 {t('plans.exampleHint')}</p>}

      <div>
        <p className="mb-1.5 text-xs font-extrabold text-tierra-700">📲 {t('plans.shareTitle')}</p>
        <ShareButtons text={shareText(plan)} path="/planes" compact />
      </div>
    </article>
  )
}

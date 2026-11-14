import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n, type Key } from '@/i18n'
import type { Climatology } from '@/services/nasa/types'
import { farmIndicators, zoneInfo } from '@/lib/farms/indicators'
import { assessNextCrop, NEXT_CROPS, NEXT_IDS, PREV_IDS, prevEmoji, type NextCropId, type NextCropResult, type PrevCropId } from '@/lib/rotation/nextCrop'
import { useLocateFarm } from '@/hooks/useLocateFarm'
import { weatherIcon } from '@/services/weather/openMeteo'
import { Skeleton } from '@/components/common'

type NowGroup = 'now' | 'wait' | 'no'
type WaitReason = 'frost' | 'dry'

export interface NowAdvice {
  crop: NextCropId
  group: NowGroup
  wait?: WaitReason
  result: NextCropResult
}

/**
 * Consejo para ESTA semana: combina el clima normal de la NASA (ajustado a tu altura)
 * con el pronóstico de 7 días. Si viene helada o una semana seca, conviene esperar.
 */
export function adviseNow(
  clim: Climatology,
  input: { prev: PrevCropId; irrigation: boolean; elevation: number; month: number },
  week: { frostDays: number; rainMm: number },
): NowAdvice[] {
  return NEXT_IDS.map((crop) => {
    const result = assessNextCrop({ ...input, next: crop }, clim)
    const c = NEXT_CROPS[crop]
    if (result.verdict === 'bad') return { crop, group: 'no' as const, result }
    if (week.frostDays > 0 && c.frostSensitive) return { crop, group: 'wait' as const, wait: 'frost' as const, result }
    if (week.rainMm < 5 && !input.irrigation && !c.perennial) return { crop, group: 'wait' as const, wait: 'dry' as const, result }
    return { crop, group: result.verdict === 'good' ? ('now' as const) : ('wait' as const), result }
  }).sort((a, b) => b.result.points - a.result.points)
}

export function ClimateNowPanel({ climatology, elevation }: { climatology: Climatology | null; elevation: number }) {
  const { profile, forecast } = useQullqa()
  const { t, month } = useI18n()
  const { status, locate } = useLocateFarm()
  const [prev, setPrev] = useState<PrevCropId>('papa')
  const [irrigation, setIrrigation] = useState(false)
  const m = new Date().getUTCMonth()

  const week = useMemo(() => {
    if (!forecast) return null
    const days = forecast.days.slice(0, 7)
    return {
      rainMm: Math.round(days.reduce((s, d) => s + d.rainMm, 0)),
      tMin: Math.round(Math.min(...days.map((d) => d.tMin)) * 10) / 10,
      tMax: Math.round(Math.max(...days.map((d) => d.tMax)) * 10) / 10,
      frostDays: days.filter((d) => d.tMin <= 0).length,
    }
  }, [forecast])

  const ind = useMemo(() => (climatology ? farmIndicators(climatology, elevation) : null), [climatology, elevation])
  const advice = useMemo(
    () => (climatology && week ? adviseNow(climatology, { prev, irrigation, elevation, month: m }, week) : []),
    [climatology, week, prev, irrigation, elevation, m],
  )

  if (!climatology || !forecast || !week || !ind) return <Skeleton className="h-72" />

  const normal = climatology.months[m]
  const weekNormal = (normal.precipMmMonth * 7) / 30
  const rainTrend = week.rainMm > weekNormal * 1.5 + 2 ? 'wetter' : week.rainMm < weekNormal * 0.5 ? 'drier' : 'normal'
  const tempDiff = Math.round((forecast.current.tempC - normal.t2m) * 10) / 10
  const wx = weatherIcon(forecast.current.code)
  const now = advice.filter((a) => a.group === 'now')
  const wait = advice.filter((a) => a.group === 'wait')
  const no = advice.filter((a) => a.group === 'no')
  const bestRotation = now.filter((a) => a.result.factors.some((f) => f.great)).concat(now.filter((a) => !a.result.factors.some((f) => f.great))).slice(0, 3)
  const name = (id: PrevCropId) => t(`rotcrop.${id}` as Key)

  return (
    <section className="card space-y-4 ring-2 ring-noche-200">
      <div>
        <p className="eyebrow text-inti-700">📍 {profile.placeName}</p>
        <h2 className="font-display text-2xl leading-tight text-noche-800">🌦️ {t('now.title')}</h2>
        <p className="mt-1 text-sm text-tierra-700">{t('now.subtitle')}</p>
      </div>

      {/* Datos de ahora */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-noche-800 p-3 text-white">
          <p className="text-xs font-bold text-noche-100">{t('now.today')}</p>
          <p className="mt-0.5 text-2xl font-extrabold">
            {wx.emoji} {Math.round(forecast.current.tempC)}°C
          </p>
          <p className="text-[11px] text-noche-100">
            💧 {forecast.current.humidity}% ·{' '}
            {Math.abs(tempDiff) < 1 ? t('now.asNormal') : tempDiff > 0 ? t('now.warmer', { d: tempDiff }) : t('now.colder', { d: Math.abs(tempDiff) })}
          </p>
        </div>
        <div className="rounded-2xl bg-tierra-50 p-3">
          <p className="text-xs font-bold text-tierra-600">⛰️ {t('now.altitude')}</p>
          <p className="mt-0.5 text-2xl font-extrabold text-noche-800">{elevation.toLocaleString()} m</p>
          <p className="text-[11px] text-tierra-700">
            {zoneInfo(ind.zone).emoji} {t(`zone.${ind.zone}.name` as Key)}
          </p>
        </div>
        <div className={`rounded-2xl p-3 ${week.frostDays > 0 ? 'bg-red-50' : 'bg-tierra-50'}`}>
          <p className="text-xs font-bold text-tierra-600">❄️ {t('now.week7')}</p>
          <p className="mt-0.5 text-lg font-extrabold text-noche-800">
            {week.tMin}° / {week.tMax}°C
          </p>
          <p className="text-[11px] text-tierra-700">{week.frostDays > 0 ? t('now.frostDays', { n: week.frostDays }) : t('now.noFrost')}</p>
        </div>
        <div className={`rounded-2xl p-3 ${rainTrend === 'drier' ? 'bg-inti-50' : 'bg-tierra-50'}`}>
          <p className="text-xs font-bold text-tierra-600">🌧️ {t('now.rain7')}</p>
          <p className="mt-0.5 text-lg font-extrabold text-noche-800">{week.rainMm} mm</p>
          <p className="text-[11px] text-tierra-700">{t(`now.rain.${rainTrend}` as Key, { normal: Math.round(weekNormal) })}</p>
        </div>
      </div>
      <p className="rounded-2xl bg-noche-50 p-3 text-xs text-noche-800">
        🛰️ {t('now.nasaNormal', { month: month(m), t: Math.round(normal.t2m * 10) / 10, mm: Math.round(normal.precipMmMonth), min: Math.round(normal.t2mMin * 10) / 10 })}
      </p>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => locate({ onboarded: true })} disabled={status === 'locating'} className="btn-dark min-h-[40px] px-4 text-sm">
          {status === 'locating' ? t('farm.locating') : `🛰️ ${t('home.loc.gps')}`}
        </button>
        <Link to="/chacra" className="btn-ghost min-h-[40px] px-4 text-sm">
          🔎 {t('home.loc.pick')}
        </Link>
      </div>
      {status === 'error' && <p className="text-xs font-semibold text-risk">{t('farm.gpsError')}</p>}

      {/* Tu chacra */}
      <div className="space-y-2">
        <h3 className="text-sm font-extrabold text-tierra-700">{t('now.lastCrop')}</h3>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={t('now.lastCrop')}>
          {PREV_IDS.map((id) => (
            <button
              key={id}
              role="radio"
              aria-checked={prev === id}
              onClick={() => setPrev(id)}
              className={`chip shrink-0 ${prev === id ? 'border-noche-800 bg-noche-800 text-white' : 'border-tierra-200 bg-white text-tierra-800'}`}
            >
              {prevEmoji(id)} {name(id)}
            </button>
          ))}
        </div>
        <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-bold text-tierra-800">
          <input type="checkbox" className="h-5 w-5 accent-noche-800" checked={irrigation} onChange={(e) => setIrrigation(e.target.checked)} />
          💧 {t('rot.check.irrigation')}
        </label>
      </div>

      {/* Qué sembrar ahora */}
      <div className="space-y-2" aria-live="polite">
        <Group tone="good" title={t('now.plantNow', { month: month(m) })} items={now} empty={t('now.noneNow')} />
        <Group tone="fair" title={t('now.wait')} items={wait} />
        <Group tone="bad" title={t('now.notThisMonth')} items={no} />
      </div>

      {bestRotation.length > 0 && (
        <p className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-900">
          🔄 {t('now.rotation', { prev: name(prev), crops: bestRotation.map((a) => `${NEXT_CROPS[a.crop].emoji} ${name(a.crop)}`).join(', ') })}
        </p>
      )}
      <p className="text-[11px] text-tierra-500">{t('now.source')}</p>
    </section>
  )
}

function Group({ tone, title, items, empty }: { tone: 'good' | 'fair' | 'bad'; title: string; items: NowAdvice[]; empty?: string }) {
  const { t } = useI18n()
  const box = tone === 'good' ? 'bg-green-50' : tone === 'fair' ? 'bg-inti-50' : 'bg-red-50'
  const icon = tone === 'good' ? '✅' : tone === 'fair' ? '⏳' : '👎'
  if (items.length === 0 && !empty) return null
  return (
    <div className={`rounded-2xl p-3 ${box}`}>
      <p className="mb-1.5 text-sm font-extrabold text-noche-800">
        {icon} {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-tierra-700">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((a) => (
            <li key={a.crop} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-tierra-900">
              {NEXT_CROPS[a.crop].emoji} {t(`rotcrop.${a.crop}` as Key)}
              {a.wait && <span className="font-semibold text-tierra-600"> · {t(`now.why.${a.wait}` as Key)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

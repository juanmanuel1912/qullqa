import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { useI18n } from '@/i18n'
import { useEnso } from '@/hooks/useEnso'
import { VARIETIES } from '@/lib/agro'
import { CROPS } from '@/lib/crops/catalog'
import { answerLocally } from '@/lib/assistant/local'
import { askClaude, AssistantUnavailable, type ChatTurn } from '@/services/assistant/chat'
import { Notice, Pleiades } from '@/components/common'

interface Bubble extends ChatTurn {
  source?: 'claude' | 'local'
}

const SUGGESTIONS = ['chat.suggest1', 'chat.suggest2', 'chat.suggest3', 'chat.suggest4'] as const

export default function ChatScreen() {
  const q = useQullqa()
  const i18n = useI18n()
  const { t, lang, L } = i18n
  const { status: enso } = useEnso()
  const [messages, setMessages] = useState<Bubble[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'claude' | 'local' | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const variety = VARIETIES[q.profile.variety].name
  const elev = Math.round(q.forecast?.elevation ?? q.climatology?.elevation ?? 0)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  /** Datos de la chacra que recibe Claude. */
  const context = () => ({
    today: q.today.toISOString().slice(0, 10),
    farm: {
      place: q.profile.placeName,
      lat: q.profile.lat,
      lon: q.profile.lon,
      altitude_m: elev,
      nasa_grid_altitude_m: q.climatology?.elevation ? Math.round(q.climatology.elevation) : null,
      potato_variety: variety,
      planting_date: q.profile.plantingDate,
      crop_status: q.crop
        ? { stage: q.crop.stage.id, progress_pct: Math.round(q.crop.progress * 100), harvest_date: q.crop.harvestDate?.toISOString().slice(0, 10), days_to_harvest: q.crop.daysToHarvest }
        : null,
    },
    climate_normals_nasa_power_2001_2025: q.climatology?.months.map((m) => ({
      month: m.month + 1,
      mean_temp_c: m.t2m,
      coldest_min_c: m.t2mMin,
      rain_mm: m.precipMmMonth,
    })),
    best_potato_sowing: q.sowing
      ? { month: q.sowing.best.month + 1, score: q.sowing.best.score, cycle_days: q.sowing.best.cycleDays, harvest: q.sowing.best.harvestDate?.toISOString().slice(0, 10) }
      : null,
    this_week: q.weekPlan
      ? { irrigate_on: q.weekPlan.irrigateOn, frost_days: q.weekPlan.frostDays, heavy_rain_days: q.weekPlan.heavyRainDays, rain_mm: q.weekPlan.weekRain, normal_rain_mm: q.weekPlan.normalRain }
      : null,
    el_nino_noaa: enso ? { phase: enso.phase, strength: enso.strength, oni: enso.oni.anom, peru_coast_anomaly: enso.coastal } : null,
    crops: CROPS.map((c) => ({ crop: L(c.name), altitude_m: c.req.altitude, min_mean_temp_c: c.req.minMeanTemp, frost_sensitive: c.req.frostSensitive, cycle_months: c.req.cycleMonths, perennial: c.req.perennial, sow_months: c.sowMonths.map((m) => m + 1), harvest_months: c.harvestMonths.map((m) => m + 1) })),
  })

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || busy) return
    const history: Bubble[] = [...messages, { role: 'user', content: question }]
    setMessages(history)
    setInput('')
    setBusy(true)
    let reply: Bubble
    try {
      const r = await askClaude(history.map(({ role, content }) => ({ role, content })), context(), lang)
      reply = { role: 'assistant', content: r.reply ?? t('chat.refused'), source: 'claude' }
      setMode('claude')
    } catch (err) {
      if (!(err instanceof AssistantUnavailable)) console.warn(err)
      const content = answerLocally(question, {
        t,
        L,
        month: i18n.month,
        fmtLong: i18n.fmtLong,
        list: i18n.list,
        place: q.profile.placeName,
        variety,
        clim: q.climatology,
        elevation: q.forecast?.elevation,
        crop: q.crop,
        weekPlan: q.weekPlan,
        enso,
        today: q.today,
      })
      reply = { role: 'assistant', content, source: 'local' }
      setMode('local')
    }
    setMessages([...history, reply])
    setBusy(false)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  return (
    <div className="flex flex-col gap-3 pb-20">
      <header className="flex items-start justify-between gap-2 pt-2">
        <div>
          <h1 className="font-display text-3xl text-noche-800">{t('chat.title')}</h1>
          <p className="text-sm text-tierra-700">{t('chat.subtitle')}</p>
        </div>
        {mode && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${mode === 'claude' ? 'bg-noche-800 text-inti-300' : 'bg-tierra-100 text-tierra-800'}`}>
            {mode === 'claude' ? `✨ ${t('chat.modeAi')}` : t('chat.modeLocal')}
          </span>
        )}
      </header>

      {mode === 'local' && <Notice tone="info">{t('chat.localNote')}</Notice>}

      <div className="flex-1 space-y-3" aria-live="polite">
        {/* Bienvenida */}
        <div className="flex gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-noche-800">
            <Pleiades className="h-5 w-7" glow={false} />
          </span>
          <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white p-3 text-[15px] shadow-card">
            {t('chat.welcome', { place: q.profile.placeName, elev })}
          </p>
        </div>

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <p key={i} className="ml-auto max-w-[85%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-noche-800 p-3 text-[15px] text-white">
              {m.content}
            </p>
          ) : (
            <div key={i} className="flex gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-noche-800">
                <Pleiades className="h-5 w-7" glow={false} />
              </span>
              <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-white p-3 text-[15px] shadow-card">{m.content}</p>
            </div>
          ),
        )}
        {busy && <p className="pl-11 text-sm font-semibold text-tierra-500">{t('chat.thinking')}</p>}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col gap-2">
          {SUGGESTIONS.map((k) => (
            <button key={k} onClick={() => void send(t(k))} className="rounded-2xl border-2 border-tierra-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-tierra-800">
              {t(k)}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-tierra-500">
        <span>{t('chat.disclaimer')}</span>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="shrink-0 font-bold underline">
            {t('chat.clear')}
          </button>
        )}
      </div>

      <form
        onSubmit={submit}
        className="fixed inset-x-0 bottom-[64px] z-30 mx-auto flex max-w-md gap-2 border-t border-tierra-100 bg-tierra-50/95 px-4 py-2 backdrop-blur"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          aria-label={t('chat.placeholder')}
          maxLength={500}
          className="min-h-[48px] flex-1 rounded-2xl border-2 border-tierra-200 bg-white px-4 text-base"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary px-4">
          {t('chat.send')}
        </button>
      </form>
    </div>
  )
}

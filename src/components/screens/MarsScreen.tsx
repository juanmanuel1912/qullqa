import { useMemo, useState } from 'react'
import { useQullqa } from '@/context/QullqaContext'
import { VARIETY_LIST, type VarietyId } from '@/lib/agro'
import { MARS, MARS_FACTS, MARS_PRESETS, simulateMars, type MarsInput } from '@/lib/mars'
import { Attribution, Starfield } from '@/components/common'

type Env = Omit<MarsInput, 'variety'>

export default function MarsScreen() {
  const { profile, sowing } = useQullqa()
  const [variety, setVariety] = useState<VarietyId>(profile.variety)
  const [env, setEnv] = useState<Env>(MARS_PRESETS[1].input)
  const result = useMemo(() => simulateMars({ ...env, variety }), [env, variety])
  const earthDays = sowing?.best.cycleDays ?? null
  const presetId = MARS_PRESETS.find(
    (p) => p.input.tempC === env.tempC && p.input.lightPct === env.lightPct && p.input.waterPct === env.waterPct,
  )?.id

  return (
    <div className="relative -mx-4 -mb-28 -mt-4 min-h-[calc(100vh-3.5rem)] space-y-4 overflow-hidden bg-noche-800 px-4 pb-28 pt-6 text-white">
      <Starfield className="opacity-70" />

      <header className="relative">
        <p className="eyebrow text-marte-400">El futuro de la papa</p>
        <h1 className="mt-1 font-display text-3xl">Qullqa en Marte</h1>
        <p className="mt-1 text-[15px] text-noche-100">
          El mismo modelo que cuida tu chacra en los Andes, en un invernadero marciano.
        </p>
      </header>

      <Greenhouse env={env} viable={result.viable} speed={result.gddPerSol} />

      {/* Resultado */}
      <section className="relative rounded-3xl bg-noche-700/90 p-5 ring-1 ring-noche-500" aria-live="polite">
        {result.viable && result.sols !== null ? (
          <>
            <p className="eyebrow text-good">¡La papa crece!</p>
            <div className="mt-2 flex items-end gap-4">
              <div>
                <p className="font-display text-5xl leading-none">{result.sols}</p>
                <p className="text-sm font-bold text-noche-200">soles hasta cosechar</p>
              </div>
              <div className="pb-1 text-noche-200">
                <p className="text-xl font-extrabold text-white">{result.earthDays} días</p>
                <p className="text-xs font-bold">terrestres</p>
              </div>
            </div>
            {earthDays && result.earthDays !== null && (
              <p className="mt-3 rounded-2xl bg-noche-600 px-4 py-3 text-sm">
                En {profile.placeName}: <strong>{earthDays} días</strong>.{' '}
                {result.earthDays < earthDays
                  ? `En Marte, ${earthDays - result.earthDays} días más rápido gracias al invernadero.`
                  : result.earthDays === earthDays
                    ? 'Igual que en tu chacra.'
                    : `En Marte tardaría ${result.earthDays - earthDays} días más.`}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="eyebrow text-marte-400">No crece</p>
            <p className="mt-2 font-display text-2xl">La papa no sobrevive así</p>
          </>
        )}
        {result.notes.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-noche-100">
            {result.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span aria-hidden="true">›</span>
                {n}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Escenarios */}
      <section className="relative grid grid-cols-3 gap-2">
        {MARS_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setEnv(p.input)}
            className={`rounded-2xl border-2 p-3 text-left text-xs transition ${
              presetId === p.id ? 'border-inti bg-inti/15' : 'border-noche-500 bg-noche-700/80'
            }`}
          >
            <span className="block text-sm font-extrabold">{p.name}</span>
            <span className="mt-1 block text-noche-200">{p.description}</span>
          </button>
        ))}
      </section>

      {/* Controles */}
      <section className="relative space-y-5 rounded-3xl bg-noche-700/90 p-5 ring-1 ring-noche-500">
        <Slider
          label="🌡️ Temperatura en el domo"
          value={env.tempC}
          min={-80}
          max={35}
          unit="°C"
          hint={`Marte afuera: ${MARS.avgSurfaceTempC} °C · ideal para papa: 14–20 °C`}
          onChange={(tempC) => setEnv({ ...env, tempC })}
        />
        <Slider
          label="☀️ Luz para las plantas"
          value={env.lightPct}
          min={0}
          max={100}
          unit="%"
          hint="Sol de Marte = 43 % del de la Tierra. Más de 43 % = luces LED"
          onChange={(lightPct) => setEnv({ ...env, lightPct })}
        />
        <Slider
          label="💧 Agua en el suelo"
          value={env.waterPct}
          min={0}
          max={100}
          unit="%"
          hint="Del hielo marciano derretido. Ideal: 60–90 %"
          onChange={(waterPct) => setEnv({ ...env, waterPct })}
        />
        <div>
          <p className="mb-2 text-sm font-bold">Variedad</p>
          <div className="flex gap-2">
            {VARIETY_LIST.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariety(v.id)}
                className={`chip flex-1 justify-center ${variety === v.id ? 'border-inti bg-inti text-noche-800' : 'border-noche-500 text-white'}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Datos curiosos */}
      <section className="relative space-y-2">
        <h2 className="text-lg font-extrabold">¿Sabías que…?</h2>
        {MARS_FACTS.map((f) => (
          <p key={f} className="rounded-2xl bg-noche-700/80 p-4 text-sm text-noche-100 ring-1 ring-noche-600">
            {f}
          </p>
        ))}
      </section>

      <div className="relative">
        <Attribution dark />
        <p className="-mt-3 text-center text-[11px] text-noche-300">Datos de Marte: NASA Mars Fact Sheet</p>
      </div>
    </div>
  )
}

function Slider(props: { label: string; value: number; min: number; max: number; unit: string; hint: string; onChange: (v: number) => void }) {
  const id = `s-${props.label}`
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-bold">
          {props.label}
        </label>
        <span className="text-xl font-extrabold text-inti">
          {props.value}
          {props.unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <p className="mt-1.5 text-xs text-noche-200">{props.hint}</p>
    </div>
  )
}

/** Domo marciano: las plantas crecen más cuanto mejor es el ambiente. */
function Greenhouse({ env, viable, speed }: { env: Env; viable: boolean; speed: number }) {
  const growth = viable ? Math.min(1, speed / 14) : 0
  const frozen = env.tempC <= 2
  const glow = Math.min(1, env.lightPct / 100)
  const plants = [70, 110, 150, 190, 230]
  return (
    <svg viewBox="0 0 300 170" className="relative mx-auto block w-full max-w-sm" role="img" aria-label={viable ? 'Invernadero con papas creciendo' : 'Invernadero sin cultivo'}>
      <defs>
        <radialGradient id="dome-light" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#faefc5" stopOpacity={0.15 + glow * 0.45} />
          <stop offset="100%" stopColor="#faefc5" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Sol lejano */}
      <circle cx="262" cy="26" r="9" fill="#ecc955" opacity="0.8" />
      {/* Suelo marciano */}
      <path d="M0 150 Q60 138 120 146 T240 142 T300 148 V170 H0 Z" fill="#c1440e" />
      <path d="M0 160 Q80 152 160 158 T300 156 V170 H0 Z" fill="#7a2a0a" />
      {/* Domo */}
      <path d="M40 148 A110 104 0 0 1 260 148 Z" fill={frozen ? '#8790bd33' : 'url(#dome-light)'} stroke="#d9ddee" strokeOpacity="0.7" strokeWidth="2" />
      <path d="M40 148 A110 104 0 0 1 260 148" fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="10" />
      {[90, 150, 210].map((x) => (
        <line key={x} x1={x} y1={148} x2={x} y2={x === 150 ? 44 : 64} stroke="#d9ddee" strokeOpacity="0.25" strokeWidth="1.5" />
      ))}
      {/* Tierra del invernadero */}
      <rect x="56" y="140" width="188" height="9" rx="3" fill={env.waterPct >= 20 ? '#54402a' : '#9c7a4f'} />
      {/* Plantas */}
      {plants.map((x, i) => {
        const h = 6 + growth * (34 + (i % 2) * 8)
        return (
          <g key={x} style={{ transition: 'all 0.5s ease' }}>
            {viable ? (
              <>
                <line x1={x} y1={140} x2={x} y2={140 - h} stroke="#2f9e44" strokeWidth="3" strokeLinecap="round" />
                <ellipse cx={x - 6} cy={140 - h * 0.6} rx={4 + growth * 5} ry={2.5 + growth * 2.5} fill="#40c057" />
                <ellipse cx={x + 6} cy={140 - h * 0.8} rx={4 + growth * 5} ry={2.5 + growth * 2.5} fill="#2f9e44" />
                {growth > 0.6 && <circle cx={x} cy={140 - h - 3} r="3" fill="#f8f0fc" />}
              </>
            ) : (
              <circle cx={x} cy={138} r="3" fill={frozen ? '#b3b9d9' : '#6e5537'} />
            )}
          </g>
        )
      })}
      {frozen && (
        <text x="150" y="104" textAnchor="middle" fontSize="28" aria-hidden="true">
          ❄️
        </text>
      )}
    </svg>
  )
}

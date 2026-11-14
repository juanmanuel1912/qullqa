import { useState } from 'react'
import { useI18n } from '@/i18n'

interface DisasterGuide {
  id: string
  emoji: string
  titleEs: string
  titleQu: string
  description: string
  detection: string[]
  prevention: string[]
  response: string[]
  recovery: string[]
}

const DISASTERS: DisasterGuide[] = [
  {
    id: 'helada',
    emoji: '❄️',
    titleEs: 'Helada (Frost)',
    titleQu: 'Ccasi',
    description:
      'Temperaturas bajo 0°C dañan hojas y tubérculo. Fatal en papa en desarrollo. Ocurre abril-septiembre en sierra.',
    detection: [
      'Escarcha blanca en plantas al amanecer',
      'Marchitez repentina de hojas',
      'Necrosis en tejido verde',
      'Tuétano ennegrecido en tubérculo cortado',
    ],
    prevention: [
      'Elegir variedades resistentes (Huayro, Ica Huanuca)',
      'Sembar en fechas recomendadas por calendario inca',
      'Preparar acolchado con paja',
      'Monitorear pronóstico de temperatura',
      'Riego nocturno antes de heladas (0.5-1 cm agua)',
    ],
    response: [
      'Cubrir plantas con arpillera o malla',
      'Hacer fuego/calentadores en puntos altos',
      'Riego abundante después de helada',
      'NO aplicar agua fría directamente',
      'Esperar 48h antes de evaluar daño',
    ],
    recovery: [
      'Remover hojas quemadas sin dañar tallos',
      'Incrementar riego 3-5 días',
      'Aplicar fertilizante foliar (urea 1%)',
      'Vigilar por enfermedades secundarias',
      'Extender ciclo +10-15 días si cultivo joven',
    ],
  },

  {
    id: 'sequia',
    emoji: '☀️',
    titleEs: 'Sequía',
    titleQu: 'Samiy',
    description:
      'Falta de agua por << 20mm lluvia/mes. Estrés hídrico detiene crecimiento y favorece plagas. El Niño puede provocar sequía extrema.',
    detection: [
      'Suelo seco a 15 cm profundidad',
      'Marchitez progresiva de hojas (mañana)',
      'Retraso en crecimiento',
      'Tubérculo pequeño o deforme',
    ],
    prevention: [
      'Riego programado: 20-30 mm/semana en crecimiento',
      'Mulch con paja (5-10 cm) reduce evaporación 30-50%',
      'Elegir variedades tolerantes (Huayro, nativas)',
      'Mejorar retención agua: + materia orgánica',
      'Monitorear estrés: humedad suelo con sensor',
    ],
    response: [
      'Riego de emergencia: 15-20 mm inmediato',
      'Aumentar frecuencia a cada 3-5 días',
      'Extender riego nocturno (menos evaporación)',
      'Mulch adicional si está disponible',
      'Poda ligera para reducir demanda',
    ],
    recovery: [
      'Continuar riego regular + 5-10 mm extra',
      'Fertilizar: nitrógeno fracciona do cada 7 días',
      'Monitorear hongos (estrés + riego = hongos)',
      'Extender ciclo de cosecha +7-14 días',
      'Evaluar: si daño > 50%, cosechar papas chicas para semilla/consumo local',
    ],
  },

  {
    id: 'inundacion',
    emoji: '🌊',
    titleEs: 'Inundación',
    titleQu: 'Yakuchiy',
    description:
      'Lluvia excesiva (>100mm/semana) o drenaje pobre encharcan el campo. La papa necesita suelo con aire; 48h encharcado = muerte.',
    detection: [
      'Agua estancada > 24h',
      'Olor a descomposición en suelo',
      'Hojas amarillas/púrpura (hipoxia)',
      'Apariencia blanda/pudricidaen tubérculo (huesped Phytophthora)',
    ],
    prevention: [
      'Drenaje de campo: surcos/trincheras cada 2-3 m',
      'Andenes (como incas): contenedores elevados 30-50 cm',
      'Elegir terrenos con pendiente > 5%',
      'Mejorar suelo: agregar compost, arcilla-arena balanceada',
      'Sembar en lomo alto en zonas húmedas',
    ],
    response: [
      'Abrir urgente drenaje de emergencia',
      'Remover agua estancada con bomba si posible',
      'NO pisar terreno encharcado (compacta más)',
      'Documentar daño para seguros/asistencia',
      'Prote ger de Phytophthora (riego estancado = Tizón Tardío)',
    ],
    recovery: [
      'Esperar 3-5 días antes de evaluar plantas',
      'Remover hojas/tallos con podredumbre',
      'Aplicar fungicida de cobre preventivo (si Tizón sospechado)',
      'Mejorar drenaje permanente: zanjas, acolchado',
      'Considerar rotación cultivos o dejar terreno en barbecho 1 año',
    ],
  },
]

export default function DisasterResponse() {
  const { t } = useI18n()
  const [selected, setSelected] = useState<string | null>(null)

  const disaster = DISASTERS.find((d) => d.id === selected)

  if (disaster) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-inti-600 font-bold hover:text-inti-700"
        >
          ← {t('alerts.back') ?? 'Back'}
        </button>

        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{disaster.emoji}</span>
            <div>
              <h2 className="font-display text-2xl font-bold text-noche-800">
                {disaster.titleEs}
              </h2>
              <p className="text-xs text-tierra-600">{disaster.titleQu}</p>
            </div>
          </div>

          <p className="text-sm text-tierra-700">{disaster.description}</p>
        </div>

        {/* Detection */}
        <section className="card space-y-3">
          <h3 className="font-extrabold text-noche-800">
            👁️ {t('alerts.detection') ?? 'Detection'}
          </h3>
          <ul className="space-y-1">
            {disaster.detection.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-tierra-700">
                <span className="shrink-0">▪</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Prevention */}
        <section className="card space-y-3">
          <h3 className="font-extrabold text-noche-800">
            ✓ {t('alerts.prevention') ?? 'Prevention'}
          </h3>
          <ul className="space-y-1">
            {disaster.prevention.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-tierra-700">
                <span className="shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Response */}
        <section className="card space-y-3">
          <h3 className="font-extrabold text-noche-800">
            🚨 {t('alerts.response') ?? 'Emergency Response'}
          </h3>
          <ul className="space-y-1">
            {disaster.response.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-tierra-700">
                <span className="shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Recovery */}
        <section className="card space-y-3">
          <h3 className="font-extrabold text-noche-800">
            🌱 {t('alerts.recovery') ?? 'Recovery'}
          </h3>
          <ul className="space-y-1">
            {disaster.recovery.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-tierra-700">
                <span className="shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {DISASTERS.map((d) => (
        <button
          key={d.id}
          onClick={() => setSelected(d.id)}
          className="card flex items-start justify-between text-left transition hover:bg-inti-50"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{d.emoji}</span>
              <h3 className="font-extrabold text-noche-800">{d.titleEs}</h3>
            </div>
            <p className="mt-1 text-xs text-tierra-600">{d.titleQu}</p>
            <p className="mt-2 line-clamp-2 text-sm text-tierra-700">
              {d.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

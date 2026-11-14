import { useState } from 'react'
import { useI18n, type Localized } from '@/i18n'

interface DisasterGuide {
  id: 'helada' | 'sequia' | 'inundacion'
  emoji: string
  title: Localized
  description: Localized
  detection: Localized[]
  prevention: Localized[]
  response: Localized[]
  recovery: Localized[]
}

/** Guías generales y prudentes. Para daños graves, buscar a la agencia agraria y a Defensa Civil. */
const DISASTERS: DisasterGuide[] = [
  {
    id: 'helada',
    emoji: '❄️',
    title: { en: 'Frost', es: 'Helada' },
    description: {
      en: 'Nights below 0 °C, most common on clear, dry nights of the highland dry season (about May–September). Frost can burn potato leaves, above all on young plants.',
      es: 'Noches bajo 0 °C, más comunes en noches despejadas y secas de la época seca en la sierra (más o menos mayo–septiembre). La helada quema las hojas de la papa, sobre todo en plantas jóvenes.',
    },
    detection: [
      { en: 'Clear sky, no wind and a cold evening: frost is likely before dawn', es: 'Cielo despejado, sin viento y atardecer frío: es probable que hiele antes del amanecer' },
      { en: 'The next morning, dark, watery leaves that later dry out', es: 'A la mañana siguiente, hojas oscuras y aguadas que luego se secan' },
    ],
    prevention: [
      { en: 'Plant on the dates the Qullqa calendar recommends for your field', es: 'Siembra en las fechas que recomienda el calendario Qullqa para tu chacra' },
      { en: 'In the highest fields, grow frost-hardy native or bitter potatoes', es: 'En las chacras más altas, siembra papas nativas o amargas resistentes a la helada' },
      { en: 'Avoid valley bottoms, where cold air settles; slopes are warmer', es: 'Evita los fondos de quebrada, donde se acumula el aire frío; las laderas son más templadas' },
      { en: 'Raised beds with water channels (waru waru) soften frost, as in Puno', es: 'Los camellones con canales de agua (waru waru) suavizan la helada, como en Puno' },
    ],
    response: [
      { en: 'Watch Qullqa frost alerts in Weather', es: 'Atiende las alertas de helada en Clima' },
      { en: 'If you can, irrigate in the evening before a frost: moist soil releases heat at night', es: 'Si puedes, riega al atardecer antes de la helada: el suelo húmedo suelta calor de noche' },
    ],
    recovery: [
      { en: 'Wait a few days before judging the damage: potatoes often regrow from lower buds', es: 'Espera unos días antes de evaluar el daño: la papa suele rebrotar de las yemas de abajo' },
      { en: 'Ask your agrarian agency before applying fertilizer or other products', es: 'Consulta a tu agencia agraria antes de aplicar abonos u otros productos' },
    ],
  },
  {
    id: 'sequia',
    emoji: '☀️',
    title: { en: 'Drought', es: 'Sequía' },
    description: {
      en: 'Rains that come late or stop. In the southern highlands, strong El Niño years often bring drought.',
      es: 'Lluvias que llegan tarde o se cortan. En la sierra sur, los años de El Niño fuerte suelen traer sequía.',
    },
    detection: [
      { en: 'Dry soil a hand deep and plants wilting in the morning', es: 'Suelo seco a un palmo de profundidad y plantas marchitas por la mañana' },
      { en: 'This week’s rain far below normal (see Weather)', es: 'Lluvia de la semana muy por debajo de lo normal (ver Clima)' },
    ],
    prevention: [
      { en: 'Harvest rainwater in qochas (small ponds) and reservoirs', es: 'Cosecha agua de lluvia en qochas y reservorios' },
      { en: 'Cover the soil with straw and add organic matter to keep moisture', es: 'Cubre el suelo con paja y agrega materia orgánica para guardar humedad' },
      { en: 'Choose early varieties and plant when rains are steady', es: 'Elige variedades precoces y siembra cuando las lluvias sean seguidas' },
    ],
    response: [
      { en: 'Give the little water you have when tubers are forming: it is the most critical stage', es: 'Da el agua que tengas cuando se forman los tubérculos: es la etapa más crítica' },
      { en: 'Water early in the morning or at dusk to lose less to evaporation', es: 'Riega temprano o al atardecer para perder menos agua' },
    ],
    recovery: [
      { en: 'Keep records and photos of losses for the agricultural insurance (SAC) and support programs', es: 'Guarda registros y fotos de las pérdidas para el Seguro Agrícola Catastrófico (SAC) y programas de apoyo' },
    ],
  },
  {
    id: 'inundacion',
    emoji: '🌊',
    title: { en: 'Flood and mudslide (huaico)', es: 'Inundación y huaico' },
    description: {
      en: 'Very heavy rain, more common in strong El Niño years on the north coast and in valleys. Waterlogged soil rots tubers, and mudslides can destroy fields and roads.',
      es: 'Lluvia muy fuerte, más común en años de El Niño fuerte en la costa norte y en los valles. El suelo encharcado pudre los tubérculos y los huaicos pueden destruir chacras y caminos.',
    },
    detection: [
      { en: 'Several days of heavy rain in the forecast', es: 'Varios días de lluvia fuerte en el pronóstico' },
      { en: 'Water standing between furrows for more than a day', es: 'Agua estancada entre surcos por más de un día' },
    ],
    prevention: [
      { en: 'Open drainage furrows and keep canals clean before the rainy season', es: 'Abre surcos de drenaje y limpia los canales antes de las lluvias' },
      { en: 'Plant on high ridges and never in riverbeds or ravines', es: 'Siembra en surcos altos y nunca en cauces ni quebradas' },
      { en: 'Terraces (andenes) and living fences reduce erosion', es: 'Los andenes y los cercos vivos reducen la erosión' },
    ],
    response: [
      { en: 'Your safety first: stay away from ravines and riverbanks during heavy rain', es: 'Primero tu seguridad: aléjate de quebradas y riberas durante lluvias fuertes' },
      { en: 'Follow SENAMHI warnings and the local Civil Defense', es: 'Sigue los avisos del SENAMHI y de Defensa Civil' },
      { en: 'When it is safe, open drains to remove standing water', es: 'Cuando sea seguro, abre drenes para sacar el agua estancada' },
    ],
    recovery: [
      { en: 'Watch for late blight (rancha) and rot in the following days', es: 'Vigila la rancha y la pudrición en los días siguientes' },
      { en: 'Record the damage for insurance and support', es: 'Registra los daños para el seguro y el apoyo' },
    ],
  },
]

export default function DisasterResponse() {
  const { t, L } = useI18n()
  const [selected, setSelected] = useState<DisasterGuide['id'] | null>(null)
  const disaster = DISASTERS.find((d) => d.id === selected)

  if (disaster) {
    const block = (title: string, items: Localized[], mark: string) => (
      <section className="card space-y-2">
        <h3 className="font-extrabold text-noche-800">{title}</h3>
        <ul className="space-y-1.5 text-sm text-tierra-800">
          {items.map((x, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true">{mark}</span>
              {L(x)}
            </li>
          ))}
        </ul>
      </section>
    )
    return (
      <div className="space-y-3">
        <button onClick={() => setSelected(null)} className="text-sm font-bold text-noche-600 underline">
          ← {t('alerts.back')}
        </button>
        <div className="card flex items-start gap-3">
          <span className="text-5xl" aria-hidden="true">
            {disaster.emoji}
          </span>
          <div>
            <h2 className="font-display text-2xl text-noche-800">{L(disaster.title)}</h2>
            <p className="mt-1 text-sm text-tierra-800">{L(disaster.description)}</p>
          </div>
        </div>
        {block(`👁️ ${t('alerts.detection')}`, disaster.detection, '•')}
        {block(`✓ ${t('alerts.prevention')}`, disaster.prevention, '✓')}
        {block(`🚨 ${t('alerts.response')}`, disaster.response, '→')}
        {block(`🌱 ${t('alerts.recovery')}`, disaster.recovery, '→')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {DISASTERS.map((d) => (
        <button key={d.id} onClick={() => setSelected(d.id)} className="card flex w-full items-start gap-3 text-left">
          <span className="text-3xl" aria-hidden="true">
            {d.emoji}
          </span>
          <span>
            <span className="block font-extrabold text-noche-800">{L(d.title)}</span>
            <span className="mt-1 line-clamp-2 text-sm text-tierra-700">{L(d.description)}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

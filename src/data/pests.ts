/**
 * Principales plagas y enfermedades de la papa en los Andes (información general).
 * Fuentes: Centro Internacional de la Papa (CIP), SENASA, INIA.
 * No incluye productos químicos: su uso debe indicarlo un agrónomo con productos registrados en SENASA.
 */
import type { Localized } from '@/i18n'

export type PestId = 'rancha' | 'gorgojo' | 'polilla'

export interface Pest {
  id: PestId
  emoji: string
  name: Localized
  /** Nombre que usan los agricultores */
  localName: string
  scientific: string
  /** Altitud donde causa más daño (m) */
  altRange: [number, number]
  description: Localized
  identification: Localized[]
  prevention: Localized[]
  biological: Localized[]
  /** Condiciones del mes que elevan el riesgo (ver lib/alerts) */
  weatherNote: Localized
}

export const PESTS: Record<PestId, Pest> = {
  rancha: {
    id: 'rancha',
    emoji: '🍂',
    name: { en: 'Late blight', es: 'Tizón tardío' },
    localName: 'rancha',
    scientific: 'Phytophthora infestans',
    altRange: [1000, 4000],
    description: {
      en: 'The most destructive potato disease in the world. It is caused by a water mold (an oomycete, not a true fungus) that spreads fast in cool, rainy weather and can destroy a field in a few days.',
      es: 'La enfermedad más destructiva de la papa en el mundo. La causa un oomiceto (un "moho de agua", no un hongo verdadero) que se propaga rápido con clima fresco y lluvioso y puede acabar con una chacra en pocos días.',
    },
    identification: [
      { en: 'Dark, water-soaked spots on leaves, often starting at the edges', es: 'Manchas oscuras y acuosas en las hojas, muchas veces desde el borde' },
      { en: 'White mold on the underside of leaves on humid mornings', es: 'Pelusa blanca en el envés de las hojas en mañanas húmedas' },
      { en: 'Brown lesions on stems; plants collapse quickly', es: 'Lesiones marrones en los tallos; las plantas se caen rápido' },
      { en: 'Reddish-brown dry rot under the skin of tubers', es: 'Pudrición seca marrón rojiza bajo la piel del tubérculo' },
    ],
    prevention: [
      { en: 'Plant healthy, certified seed', es: 'Siembra semilla sana y certificada' },
      { en: 'Ask INIA or your agrarian agency for varieties with blight resistance for your zone', es: 'Pide al INIA o a tu agencia agraria variedades con resistencia a la rancha para tu zona' },
      { en: 'Hill up well so spores do not reach the tubers', es: 'Aporca bien para que las esporas no lleguen a los tubérculos' },
      { en: 'Remove volunteer potato plants and piles of discarded potatoes', es: 'Elimina plantas "guachas" y montones de papa descartada' },
      { en: 'Check the field after several rainy days', es: 'Revisa la chacra después de varios días de lluvia' },
      { en: 'Cut the foliage about two weeks before harvest and harvest on dry days', es: 'Corta el follaje unas dos semanas antes de cosechar y cosecha en días secos' },
    ],
    biological: [
      { en: 'Pull out and bury or burn infected plants away from the field', es: 'Arranca y entierra o quema lejos de la chacra las plantas enfermas' },
      { en: 'Improve drainage and avoid watering the leaves', es: 'Mejora el drenaje y evita mojar las hojas al regar' },
    ],
    weatherNote: {
      en: 'Highest risk in months with a lot of rain and mild temperatures (about 10–20 °C).',
      es: 'Mayor riesgo en meses con mucha lluvia y temperaturas templadas (unos 10–20 °C).',
    },
  },

  gorgojo: {
    id: 'gorgojo',
    emoji: '🪲',
    name: { en: 'Andean potato weevil', es: 'Gorgojo de los Andes' },
    localName: 'gusano blanco',
    scientific: 'Premnotrypes spp.',
    altRange: [2800, 4300],
    description: {
      en: 'The main potato pest of the high Andes. The adult is a small weevil that cannot fly; its white larvae bore tunnels inside the tubers.',
      es: 'La principal plaga de la papa en la sierra alta. El adulto es un gorgojo pequeño que no vuela; sus larvas blancas hacen galerías dentro de los tubérculos.',
    },
    identification: [
      { en: 'Small dark-brown weevils that walk in from field borders at night', es: 'Gorgojos pequeños marrón oscuro que entran caminando desde los bordes, de noche' },
      { en: 'Half-moon bites on the edges of leaves', es: 'Mordeduras en forma de media luna en el borde de las hojas' },
      { en: 'Tunnels and white, curved larvae inside the tubers', es: 'Galerías y larvas blancas encorvadas dentro de los tubérculos' },
    ],
    prevention: [
      { en: 'Rotate crops: do not plant potato after potato', es: 'Rota cultivos: no siembres papa después de papa' },
      { en: 'Plastic barriers or trenches around the field stop the adults (CIP)', es: 'Barreras de plástico o zanjas alrededor de la chacra detienen a los adultos (CIP)' },
      { en: 'Harvest on time and do not leave tubers in the field', es: 'Cosecha a tiempo y no dejes papas en el campo' },
      { en: 'Keep stores clean and check the soil under the piles', es: 'Mantén limpios los almacenes y revisa el suelo bajo los montones' },
    ],
    biological: [
      { en: 'Collect adults at night on field borders', es: 'Recoge adultos de noche en los bordes de la chacra' },
      { en: 'Ask about biological control with beneficial fungi recommended by INIA or CIP', es: 'Pregunta por el control biológico con hongos benéficos que recomiendan el INIA o el CIP' },
    ],
    weatherNote: {
      en: 'Adults come out with the first rains, around planting time.',
      es: 'Los adultos salen con las primeras lluvias, cerca de la siembra.',
    },
  },

  polilla: {
    id: 'polilla',
    emoji: '🦋',
    name: { en: 'Potato tuber moth', es: 'Polilla de la papa' },
    localName: 'polilla',
    scientific: 'Phthorimaea operculella, Symmetrischema tangolias',
    altRange: [0, 3800],
    description: {
      en: 'Small moths whose larvae mine leaves and, above all, tubers. The worst damage often happens in storage.',
      es: 'Polillas pequeñas cuyas larvas minan las hojas y, sobre todo, los tubérculos. El mayor daño suele ocurrir en el almacén.',
    },
    identification: [
      { en: 'Small grey-brown moths flying at dusk', es: 'Polillas pequeñas gris parduscas que vuelan al atardecer' },
      { en: 'Mines in leaves and holes with fine droppings in tubers', es: 'Minas en las hojas y agujeros con excremento fino en los tubérculos' },
      { en: 'Larvae inside stored potatoes', es: 'Larvas dentro de las papas almacenadas' },
    ],
    prevention: [
      { en: 'Hill up well so tubers are not exposed', es: 'Aporca bien para que los tubérculos no queden expuestos' },
      { en: 'Harvest on time and do not leave potatoes in the field overnight', es: 'Cosecha a tiempo y no dejes papas en el campo de noche' },
      { en: 'Store only healthy tubers; keep seed in diffused-light stores', es: 'Guarda solo tubérculos sanos; conserva la semilla en almacenes de luz difusa' },
      { en: 'Use pheromone traps to watch how many moths there are', es: 'Usa trampas de feromonas para vigilar cuántas polillas hay' },
    ],
    biological: [
      { en: 'Biological products based on a granulovirus (developed by CIP) protect stored potatoes', es: 'Productos biológicos con granulovirus (desarrollados por el CIP) protegen la papa almacenada' },
      { en: 'Remove and destroy damaged tubers', es: 'Separa y destruye los tubérculos dañados' },
    ],
    weatherNote: {
      en: 'More generations in warm, dry months and in storage.',
      es: 'Más generaciones en meses cálidos y secos y en el almacén.',
    },
  },
}

export const PEST_ORDER: PestId[] = ['rancha', 'gorgojo', 'polilla']

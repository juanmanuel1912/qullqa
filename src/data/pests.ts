/**
 * Base de datos de plagas de papa en Andes
 * Información de SENASA, CIP, FAO
 */

export type PestId = 'polilla' | 'gorgojo' | 'trips' | 'tizonTardio'
export type PestRisk = 'low' | 'medium' | 'high'

export interface Pest {
  id: PestId
  nameEs: string
  nameQu: string
  emoji: string
  altRange: [number, number] // msnm
  description: string
  identification: string[]
  lifecycle: {
    stage1: string
    stage2: string
    stage3: string
    stage4: string
  }
  generationsPerYear: string
  susceptibleVarieties: string[]
  resistantVarieties: string[]
  prevention: string[]
  earlyDetection: string[]
  control: {
    organic: string[]
    chemical: string[]
  }
  ninoImpact: string
}

export const PESTS: Record<PestId, Pest> = {
  polilla: {
    id: 'polilla',
    nameEs: 'Polilla de la Papa',
    nameQu: 'Tecia',
    emoji: '🦋',
    altRange: [1500, 3800],
    description:
      'Mariposa pequeña (8-10 mm) que perfora tubérculos. Larva tuneliza, causando "ojos negros" en papa almacenada. Mayor amenaza en sierra peruana.',
    identification: [
      'Mariposa pequeña, grisácea',
      'Larva blanca dentro del tubérculo',
      'Orificios pequeños con polvo fino',
      'Aroma característico en almacén',
    ],
    lifecycle: {
      stage1: 'Huevo: 3-5 días',
      stage2: 'Larva: 20-40 días',
      stage3: 'Pupa: 7-14 días',
      stage4: 'Adulto: varias generaciones',
    },
    generationsPerYear: '3-6 generaciones (según altitud)',
    susceptibleVarieties: ['Yungay', 'Canchán'],
    resistantVarieties: ['Huayro'],
    prevention: [
      'Desinfectar almacenes con cal y vinagre',
      'Rotación de campos (3+ años)',
      'Usar variedades resistentes',
      'Monitoreo con trampas de feromonas',
      'Evitar papa infestada en semilla',
    ],
    earlyDetection: [
      'Buscar orificios pequeños en tubérculo',
      'Polvo fino (heces) en grietas',
      'Larvas dentro del tubérculo',
      'Adultos en trampas de feromonas',
    ],
    control: {
      organic: [
        'Tierra de diatomeas (SiO₂)',
        'Frío 4°C detiene larvas',
        'Remover papas infestadas',
      ],
      chemical: [
        'Lambda cihalotrina',
        'Cipermetrina',
        'Spinosad',
      ],
    },
    ninoImpact: 'Temperatura ↑ acelera ciclo. Humedad ↑ favorece oviposición. Riesgo extremo.',
  },

  gorgojo: {
    id: 'gorgojo',
    nameEs: 'Gorgojo de la Papa',
    nameQu: 'Qispi',
    emoji: '🪲',
    altRange: [2000, 3900],
    description:
      'Coleóptero negro (7-9 mm) que come raíces y tubérculo desde dentro. Daño: túneles ramificados y pudrición. Más común en alta montaña.',
    identification: [
      'Coleóptero negro, pequeño',
      'Larva dentro del tubérculo',
      'Túneles ramificados en papa',
      'Marchitez repentina de plantas',
    ],
    lifecycle: {
      stage1: 'Huevo: 7-10 días',
      stage2: 'Larva: 40-60 días',
      stage3: 'Pupa: 14-21 días',
      stage4: 'Adulto: largo',
    },
    generationsPerYear: '1-2 generaciones',
    susceptibleVarieties: ['Canchán'],
    resistantVarieties: ['Yungay', 'Huayro'],
    prevention: [
      'Campo limpio (sin restos de papa)',
      'Rotación cultivos (no solanáceas)',
      'Variedades resistentes',
      'Mulch con paja (barrera física)',
      'Trampas: papas cortadas como cebo',
    ],
    earlyDetection: [
      'Marchitez repentina de plantas',
      'Raíces dañadas, deshilachadas',
      'Túneles en tubérculo',
      'Presencia de adultos en suelo',
    ],
    control: {
      organic: [
        'Cosechar temprano (antes larva termine)',
        'Desinfestar herramientas',
        'Enterrar papas infestadas',
      ],
      chemical: [
        'Cipermetrina',
        'Imidacloprid (sistémico)',
      ],
    },
    ninoImpact: 'Lluvia excesiva favorece larvas. Heladas débiles permiten supervivencia.',
  },

  trips: {
    id: 'trips',
    nameEs: 'Trips',
    nameQu: 'Chisin',
    emoji: '🪰',
    altRange: [1000, 3000],
    description:
      'Insecto diminuto (1-2 mm), alargado. Se alimentan de hojas, flores y tubérculo. Daño: estrías plateadas en hoja, russetting en papa.',
    identification: [
      'Insecto diminuto, casi invisible',
      'Estrías plateadas en hojas',
      'Russetting (manchas ásperas) en papa',
      'Presencia en envés de hoja',
    ],
    lifecycle: {
      stage1: 'Huevo: 3-5 días',
      stage2: 'Ninfa: 5-10 días',
      stage3: 'Pupa: 2-3 días',
      stage4: 'Adulto: múltiples generaciones',
    },
    generationsPerYear: '6-10 generaciones (clima cálido)',
    susceptibleVarieties: ['Yungay', 'Canchán'],
    resistantVarieties: ['Huayro'],
    prevention: [
      'Riego adecuado (reduce estrés)',
      'Controlar malezas (hospederos)',
      'Variedades tolerantes',
      'Malla anti-insecto en semillero',
    ],
    earlyDetection: [
      'Estrías plateadas en hojas nuevas',
      'Russetting (manchas ásperas) en papa',
      'Insectos diminutos en envés',
      'Marchitez prematura',
    ],
    control: {
      organic: [
        'Ajo + jabón potásico',
        'Agua jabonosa (spray)',
        'Neem oil',
      ],
      chemical: [
        'Spinosad',
        'Fipronil',
        'Piretrinas sintéticas',
      ],
    },
    ninoImpact: 'Temperatura ↑ y sequedad favorecen plagas explosivas. Luz LED adicional atrae.',
  },

  tizonTardio: {
    id: 'tizonTardio',
    nameEs: 'Tizón Tardío',
    nameQu: 'Unquchikuy',
    emoji: '🍂',
    altRange: [2500, 3800],
    description:
      'Enfermedad fúngica (oomycete Phytophthora infestans). Lesiones necróticas en hojas y tallos. Pudición marrón en tubérculo. LA MÁS DESTRUCTIVA.',
    identification: [
      'Lesiones acuosas en borde de hoja',
      'Anillo amarillento alrededor lesión',
      'Esporangios en envés (polvo blanco si humedad)',
      'Olor característico (descomposición)',
      'Marchitez rápida de planta',
    ],
    lifecycle: {
      stage1: 'Espora: germina en hoja',
      stage2: 'Penetración: 1-2 días',
      stage3: 'Colonización: 3-7 días',
      stage4: 'Esporulación: 1-2 días',
    },
    generationsPerYear: '15+ generaciones en condiciones óptimas',
    susceptibleVarieties: ['Canchán', 'Yungay'],
    resistantVarieties: ['Huayro', 'Ica Huanuca'],
    prevention: [
      'Deshoje 30 días antes cosecha',
      'Variedades resistentes',
      'Rotación campos (2-3 años)',
      'Desinfectar semilla (agua 50°C, 15 min)',
      'Fungicidas preventivos (monthly): clorotalonil, oxicloruro cobre',
    ],
    earlyDetection: [
      'Lesiones acuosas en borde hoja',
      'Anillo amarillento',
      'Esporangios en envés',
      'Olor de descomposición',
      'Marchitez repentina',
    ],
    control: {
      organic: [
        'Remover hojas/plantas infectadas',
        'Mejorar drenaje, reducir riego',
        'Cobre fungicida (preventivo)',
      ],
      chemical: [
        'Mancozeb (preventivo)',
        'Metalaxil (sistémico)',
        'Hidróxido de cobre',
        'Famoxadone + cymoxanil',
      ],
    },
    ninoImpact: 'LLUVIA EXCESIVA + 10-20°C = PERFECTO para P. infestans. RIESGO EXTREMO EN SIERRA.',
  },
}

export const PEST_ORDER: PestId[] = ['tizonTardio', 'polilla', 'gorgojo', 'trips']

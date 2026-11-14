/**
 * El mundo de la papa: variedades, zonas, siembra, cocina y transformación.
 * Selección curada (no exhaustiva). Fuentes: CIP, INIA, MIDAGRI, Agraria.pe, Andina.
 */
import type { Localized } from '@/i18n'

export type PotatoKind = 'improved' | 'native' | 'bitter'

export interface PotatoInfo {
  id: string
  name: string
  kind: PotatoKind
  /** Color para el ícono */
  skin: string
  flesh: string
  /** Altitud típica (m s. n. m.) */
  altitude: [number, number]
  where: Localized
  uses: Localized
  note: Localized
  mostSold?: boolean
  /** Punto representativo de su zona principal de cultivo (aprox.) */
  map: [number, number]
}

export const POTATOES: PotatoInfo[] = [
  {
    id: 'yungay',
    map: [-12.07, -75.2],
    name: 'Yungay',
    kind: 'improved',
    skin: '#e8d3b0',
    flesh: '#f6ecd0',
    altitude: [2500, 3800],
    mostSold: true,
    where: { en: 'Highlands across Peru', es: 'Sierra de todo el Perú' },
    uses: {
      en: 'Boiled, papa rellena, pastel de papa, papa a la huancaína, soups',
      es: 'Sancochada, papa rellena, pastel de papa, papa a la huancaína, sopas',
    },
    note: {
      en: 'Created by La Molina Agrarian University and named in honor of the victims of the 1970 Yungay earthquake. The best-selling potato in Lima.',
      es: 'Creada por la Universidad Agraria La Molina en homenaje a las víctimas del terremoto de Yungay de 1970. La papa más vendida en Lima.',
    },
  },
  {
    id: 'canchan',
    map: [-9.93, -76.24],
    name: 'Canchán (INIA 303)',
    kind: 'improved',
    skin: '#c9606e',
    flesh: '#f7f0df',
    altitude: [1800, 3500],
    where: { en: 'Valleys and highlands (Huánuco, Lima, Junín)', es: 'Valles y sierra (Huánuco, Lima, Junín)' },
    uses: { en: 'French fries, lomo saltado, boiled', es: 'Papas fritas, lomo saltado, sancochada' },
    note: {
      en: 'Released by INIA in 1990 together with the International Potato Center (CIP). Pink skin, early harvest. Grown on about 11% of Peru’s potato area.',
      es: 'Liberada por el INIA en 1990 junto con el Centro Internacional de la Papa (CIP). Piel rosada y cosecha precoz. Ocupa cerca del 11 % del área papera del Perú.',
    },
  },
  {
    id: 'unica',
    map: [-13.08, -76.39],
    name: 'Única',
    kind: 'improved',
    skin: '#c97a6a',
    flesh: '#f5ead2',
    altitude: [0, 2500],
    where: { en: 'Coastal valleys, mainly the Lima region', es: 'Valles de la costa, sobre todo la región Lima' },
    uses: { en: 'French fries, chips, everyday cooking', es: 'Papas fritas, hojuelas, cocina diaria' },
    note: {
      en: 'One of the leading improved varieties in Peru’s markets, adapted to the warmer coast.',
      es: 'Una de las variedades mejoradas que lideran los mercados del Perú, adaptada a la costa templada.',
    },
  },
  {
    id: 'amarilis',
    map: [-9.6, -76.0],
    name: 'Amarilis (INIA)',
    kind: 'improved',
    skin: '#e4c9a0',
    flesh: '#f4e3b5',
    altitude: [2500, 3600],
    where: { en: 'Andean highlands', es: 'Sierra andina' },
    uses: { en: 'Boiled, soups, stews', es: 'Sancochada, sopas, guisos' },
    note: {
      en: 'Bred by INIA with CIP. Grown on about 10% of Peru’s potato area.',
      es: 'Desarrollada por el INIA con el CIP. Ocupa cerca del 10 % del área papera del Perú.',
    },
  },
  {
    id: 'amarilla',
    map: [-10.68, -76.26],
    name: 'Amarilla Tumbay',
    kind: 'native',
    skin: '#e9c46a',
    flesh: '#f6c945',
    altitude: [2800, 3800],
    where: { en: 'Central highlands (Huánuco, Junín, Pasco)', es: 'Sierra central (Huánuco, Junín, Pasco)' },
    uses: { en: 'Causa limeña, mashed potatoes, papa a la huancaína, ají de gallina', es: 'Causa limeña, puré, papa a la huancaína, ají de gallina' },
    note: {
      en: 'The famous "yellow potato": creamy, golden flesh. Delicate: it does not keep long after harvest.',
      es: 'La famosa "papa amarilla": pulpa dorada y cremosa. Es delicada: dura poco después de la cosecha.',
    },
  },
  {
    id: 'peruanita',
    map: [-11.78, -75.5],
    name: 'Peruanita',
    kind: 'native',
    skin: '#d1495b',
    flesh: '#f6c945',
    altitude: [2800, 3800],
    where: { en: 'Central highlands', es: 'Sierra central' },
    uses: { en: 'Boiled, salads, papa a la huancaína', es: 'Sancochada, ensaladas, papa a la huancaína' },
    note: {
      en: 'Red-and-yellow skin with yellow flesh, like the colors of Peru’s flag.',
      es: 'Piel roja y amarilla con pulpa amarilla, con los colores de la bandera peruana.',
    },
  },
  {
    id: 'huayro',
    map: [-12.79, -74.97],
    name: 'Huayro',
    kind: 'native',
    skin: '#7b2d43',
    flesh: '#f2e6c8',
    altitude: [3000, 3900],
    where: { en: 'Central and southern highlands', es: 'Sierra central y sur' },
    uses: { en: 'Soups, boiled, pachamanca, papa a la huancaína', es: 'Sopas, sancochada, pachamanca, papa a la huancaína' },
    note: {
      en: 'Long, reddish-purple and very floury. Loved in Andean soups and in Lima’s markets.',
      es: 'Alargada, morada rojiza y muy harinosa. Querida en las sopas andinas y en los mercados de Lima.',
    },
  },
  {
    id: 'huamantanga',
    map: [-11.47, -76.62],
    name: 'Huamantanga',
    kind: 'native',
    skin: '#3b2c45',
    flesh: '#f3e9d2',
    altitude: [3000, 3800],
    where: { en: 'Highlands of the Lima region', es: 'Sierra de la región Lima' },
    uses: { en: 'Boiled, pachamanca, huatia', es: 'Sancochada, pachamanca, huatia' },
    note: { en: 'Dark-skinned native potato with floury, full-flavored flesh.', es: 'Papa nativa de piel oscura, pulpa harinosa y mucho sabor.' },
  },
  {
    id: 'ccompis',
    map: [-13.53, -71.97],
    name: 'Ccompis',
    kind: 'native',
    skin: '#9c6a8a',
    flesh: '#f3ead2',
    altitude: [3500, 4000],
    where: { en: 'Cusco and Puno', es: 'Cusco y Puno' },
    uses: { en: 'Boiled, huatia, tunta (white chuño)', es: 'Sancochada, huatia, tunta (chuño blanco)' },
    note: {
      en: 'A native potato of the southern Andes. In Puno it is one of the best for making tunta.',
      es: 'Papa nativa de los Andes del sur. En Puno es de las mejores para hacer tunta.',
    },
  },
  {
    id: 'imilla',
    map: [-15.84, -70.02],
    name: 'Imilla negra',
    kind: 'native',
    skin: '#2b1f33',
    flesh: '#f1e6cc',
    altitude: [3800, 4000],
    where: { en: 'Altiplano of Puno and Bolivia', es: 'Altiplano de Puno y Bolivia' },
    uses: { en: 'Boiled, huatia, chuño', es: 'Sancochada, huatia, chuño' },
    note: { en: 'Dark-skinned potato of the high plateau around Lake Titicaca.', es: 'Papa de piel oscura del altiplano, alrededor del lago Titicaca.' },
  },
  {
    id: 'lukki',
    map: [-16.2, -69.6],
    name: "Luk'i (papa amarga)",
    kind: 'bitter',
    skin: '#8a8f6a',
    flesh: '#f0ecd8',
    altitude: [3800, 4200],
    where: { en: 'High plateau above 3,800 m (Puno, Bolivia)', es: 'Altiplano sobre 3 800 m (Puno, Bolivia)' },
    uses: { en: 'Chuño and tunta only', es: 'Solo chuño y tunta' },
    note: {
      en: 'Frost-hardy species (Solanum juzepczukii and S. curtilobum). Too bitter to eat fresh because of its glycoalkaloids, so it is freeze-dried into chuño.',
      es: 'Especies resistentes a la helada (Solanum juzepczukii y S. curtilobum). Es demasiado amarga para comerla fresca por sus glicoalcaloides; por eso se convierte en chuño.',
    },
  },
  {
    id: 'locka',
    map: [-16.09, -69.64],
    name: 'Locka',
    kind: 'bitter',
    skin: '#b4a58a',
    flesh: '#f5f1e2',
    altitude: [3800, 4100],
    where: { en: 'Altiplano of Puno', es: 'Altiplano de Puno' },
    uses: { en: 'Tunta (white chuño)', es: 'Tunta (chuño blanco)' },
    note: {
      en: 'In studies in Puno it gave the highest tunta yield: about 12 kg of tunta from 60 kg of fresh potatoes.',
      es: 'En estudios en Puno dio el mayor rendimiento de tunta: unos 12 kg de tunta por cada 60 kg de papa fresca.',
    },
  },
]

export interface Zone {
  id: string
  name: Localized
  altitude: string
  text: Localized
  examples: string
  color: string
}

/** Regiones naturales del Perú (Pulgar Vidal) donde crece la papa. */
export const ZONES: Zone[] = [
  {
    id: 'puna',
    name: { en: 'Puna', es: 'Puna' },
    altitude: '4 000 – 4 200 m',
    text: {
      en: 'Hard frosts almost every night in winter. Only bitter potatoes survive, and they become chuño and tunta.',
      es: 'Heladas fuertes casi todas las noches de invierno. Solo resisten las papas amargas, que se vuelven chuño y tunta.',
    },
    examples: "Luk'i, Locka",
    color: '#8790bd',
  },
  {
    id: 'suni',
    name: { en: 'Suni', es: 'Suni' },
    altitude: '3 500 – 4 000 m',
    text: {
      en: 'Cold and windy. The home of the native potatoes, grown in rotation with oca, olluco and mashua.',
      es: 'Frío y ventoso. La casa de las papas nativas, sembradas en rotación con oca, olluco y mashua.',
    },
    examples: 'Ccompis, Imilla, Huayro',
    color: '#5d6699',
  },
  {
    id: 'quechua',
    name: { en: 'Quechua', es: 'Quechua' },
    altitude: '2 300 – 3 500 m',
    text: {
      en: 'Mild valleys with summer rains. Most of Peru’s potatoes for the market are grown here.',
      es: 'Valles templados con lluvias de verano. Aquí se siembra la mayor parte de la papa para el mercado.',
    },
    examples: 'Yungay, Canchán, Amarilis, Amarilla, Peruanita',
    color: '#2f9e44',
  },
  {
    id: 'costa',
    name: { en: 'Coast and valleys', es: 'Costa y valles' },
    altitude: '0 – 2 300 m',
    text: {
      en: 'Irrigated farms with a winter crop. Improved varieties that tolerate warmth, mainly for frying.',
      es: 'Chacras con riego y campaña de invierno. Variedades mejoradas que toleran el calor, sobre todo para freír.',
    },
    examples: 'Única, Canchán',
    color: '#d4af37',
  },
]

export interface Step {
  title: Localized
  text: Localized
}

export const PLANTING_STEPS: Step[] = [
  {
    title: { en: 'Choose the date', es: 'Elige la fecha', qu: "P'unchawta akllay" },
    text: {
      en: 'Plant when the rains are steady and the frosts are over. Qullqa’s calendar calculates it for your farm with NASA data.',
      es: 'Siembra cuando las lluvias sean seguidas y pasen las heladas. El calendario de Qullqa lo calcula para tu chacra con datos de la NASA.',
    },
  },
  {
    title: { en: 'Prepare the soil', es: 'Prepara la tierra', qu: 'Allpata wakichiy' },
    text: {
      en: 'Loosen the soil 25–30 cm deep (chakra yapuy) and mix in well-composted manure.',
      es: 'Afloja la tierra a 25–30 cm (chakra yapuy) y mezcla guano de corral bien descompuesto.',
    },
  },
  {
    title: { en: 'Pick the seed', es: 'Escoge la semilla', qu: 'Muhuta akllay' },
    text: {
      en: 'Use healthy tubers of 40–80 g with short, strong sprouts (1–2 cm). Never use potatoes with rot or pests.',
      es: 'Usa tubérculos sanos de 40–80 g con brotes cortos y fuertes (1–2 cm). Nunca papas con pudrición o plagas.',
    },
  },
  {
    title: { en: 'Plant', es: 'Siembra', qu: 'Tarpuy' },
    text: {
      en: 'Furrows 90–100 cm apart, one seed every 30 cm, about 10 cm deep. Cover with loose soil.',
      es: 'Surcos a 90–100 cm, una semilla cada 30 cm, a unos 10 cm de profundidad. Tapa con tierra suelta.',
    },
  },
  {
    title: { en: 'Hill up', es: 'Aporca', qu: 'Hallmay' },
    text: {
      en: 'First hilling at 30–45 days, second at flowering. Piling soil around the plant gives room for more potatoes.',
      es: 'Primer aporque a los 30–45 días y segundo en la floración. Juntar tierra al pie da espacio a más papas.',
    },
  },
  {
    title: { en: 'Protect', es: 'Protege', qu: 'Waqaychay' },
    text: {
      en: 'Watch for late blight (rancha) in rainy months and for the Andean potato weevil. On clear, frosty nights, watering at dusk helps.',
      es: 'Vigila la rancha en los meses de lluvia y el gorgojo de los Andes. En noches despejadas con helada, regar al atardecer ayuda.',
    },
  },
  {
    title: { en: 'Harvest and store', es: 'Cosecha y guarda', qu: 'Allay, waqaychay' },
    text: {
      en: 'Harvest when the leaves turn yellow, on dry days. Let the skin cure 1–2 weeks in the shade and store in a cool, dark, airy place.',
      es: 'Cosecha cuando las hojas amarillean, en días secos. Deja curar la piel 1–2 semanas a la sombra y guarda en un lugar fresco, oscuro y ventilado.',
    },
  },
]

export interface Dish {
  name: string
  emoji: string
  potato: Localized
  text: Localized
}

export const DISHES: Dish[] = [
  {
    name: 'Causa limeña',
    emoji: '🟨',
    potato: { en: 'Yellow potato (Amarilla Tumbay)', es: 'Papa amarilla (Tumbay)' },
    text: {
      en: 'Cold layers of yellow potato mashed with lime and ají amarillo, filled with chicken or tuna.',
      es: 'Capas frías de papa amarilla prensada con limón y ají amarillo, rellenas de pollo o atún.',
    },
  },
  {
    name: 'Papa rellena',
    emoji: '🥔',
    potato: { en: 'White floury potato (Yungay, Canchán) or yellow', es: 'Papa blanca harinosa (Yungay, Canchán) o amarilla' },
    text: {
      en: 'Mashed potato shaped around minced beef, egg and olives, then fried until golden.',
      es: 'Puré de papa relleno de carne picada, huevo y aceitunas, frito hasta dorar.',
    },
  },
  {
    name: 'Pastel de papa',
    emoji: '🧀',
    potato: { en: 'White potato (Yungay)', es: 'Papa blanca (Yungay)' },
    text: {
      en: 'A classic from Arequipa: layers of thin-sliced potato baked with cheese, milk and eggs.',
      es: 'Clásico de Arequipa: capas de papa en rodajas horneadas con queso, leche y huevos.',
    },
  },
  {
    name: 'Papa a la huancaína',
    emoji: '🌶️',
    potato: { en: 'Yellow or white potato', es: 'Papa amarilla o blanca' },
    text: {
      en: 'Boiled potatoes covered with a creamy sauce of ají amarillo and fresh cheese.',
      es: 'Papas sancochadas cubiertas con una crema de ají amarillo y queso fresco.',
    },
  },
  {
    name: 'Ocopa arequipeña',
    emoji: '🌿',
    potato: { en: 'White potato', es: 'Papa blanca' },
    text: {
      en: 'Boiled potatoes with a sauce of huacatay herb, ají mirasol, peanuts and cheese.',
      es: 'Papas sancochadas con salsa de huacatay, ají mirasol, maní y queso.',
    },
  },
  {
    name: 'Lomo saltado',
    emoji: '🍟',
    potato: { en: 'Canchán or Única, fried', es: 'Canchán o Única, fritas' },
    text: {
      en: 'Stir-fried beef with onion and tomato, served with French fries and rice.',
      es: 'Carne salteada con cebolla y tomate, servida con papas fritas y arroz.',
    },
  },
  {
    name: 'Carapulcra',
    emoji: '🍲',
    potato: { en: 'Papa seca (dried potato)', es: 'Papa seca' },
    text: {
      en: 'One of Peru’s oldest stews, made with dried potato, pork, peanuts and ají panca.',
      es: 'Uno de los guisos más antiguos del Perú, con papa seca, cerdo, maní y ají panca.',
    },
  },
  {
    name: 'Chairo',
    emoji: '🥣',
    potato: { en: 'Chuño', es: 'Chuño' },
    text: {
      en: 'Hearty soup from Puno with chuño, meat, broad beans and grains: perfect for the cold altiplano.',
      es: 'Sopa contundente de Puno con chuño, carne, habas y cereales: perfecta para el frío del altiplano.',
    },
  },
  {
    name: 'Huatia / Pachamanca',
    emoji: '🔥',
    potato: { en: 'Native potatoes (Huayro, Peruanita, Imilla)', es: 'Papas nativas (Huayro, Peruanita, Imilla)' },
    text: {
      en: 'Potatoes cooked inside an oven of hot earth or stones, the ancestral Andean way.',
      es: 'Papas cocidas dentro de un horno de tierra o piedras calientes, a la manera ancestral andina.',
    },
  },
  {
    name: 'Mazamorra morada',
    emoji: '🍇',
    potato: { en: 'Potato starch ("chuño" in Peruvian kitchens)', es: 'Almidón de papa ("chuño" en la cocina peruana)' },
    text: {
      en: 'Purple corn dessert thickened with potato starch.',
      es: 'Postre de maíz morado espesado con almidón de papa.',
    },
  },
]

export const PROCESSES: Step[] = [
  {
    title: { en: 'Black chuño', es: 'Chuño negro', qu: "Ch'uñu" },
    text: {
      en: 'In June and July, above 3,800 m, bitter potatoes are spread on the ground to freeze at night and thaw in the sun. They are trampled to squeeze out the water and dried. The result keeps for years.',
      es: 'En junio y julio, sobre los 3 800 m, se tienden las papas amargas para que se congelen de noche y se descongelen al sol. Se pisan para sacarles el agua y se secan. Así duran años.',
    },
  },
  {
    title: { en: 'Tunta (white chuño, moraya)', es: 'Tunta (chuño blanco, moraya)', qu: 'Tunta' },
    text: {
      en: 'The frozen potatoes are soaked for weeks in cold running streams, then dried. They turn white and mild. Puno is Peru’s main producer.',
      es: 'Las papas congeladas se remojan semanas en riachuelos de agua fría y luego se secan. Quedan blancas y suaves. Puno es el principal productor del Perú.',
    },
  },
  {
    title: { en: 'Papa seca (dried potato)', es: 'Papa seca' },
    text: {
      en: 'Potatoes are boiled, peeled, cut and sun-dried. It is the base of carapulcra and sopa seca.',
      es: 'La papa se sancocha, se pela, se pica y se seca al sol. Es la base de la carapulcra y la sopa seca.',
    },
  },
  {
    title: { en: 'Potato starch and flour', es: 'Almidón y harina de papa' },
    text: {
      en: 'Starch (called "chuño" in Lima kitchens) settles out of grated potatoes left in water; it thickens desserts and sauces. Potato flour is made by drying and milling whole potatoes; it is used in breads, soups and baby food.',
      es: 'El almidón (que en Lima llaman "chuño") se asienta del agua donde se deja la papa rallada; espesa postres y salsas. La harina de papa se hace secando y moliendo la papa entera; se usa en panes, sopas y papillas.',
    },
  },
]

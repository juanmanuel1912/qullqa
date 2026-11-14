import type { Key } from './en'

/**
 * Runasimi (quechua sureño, Cusco-Collao) — BETA.
 * Solo frases cortas y vocabulario seguro. Lo que falta se muestra en español.
 * Pendiente: revisión por un hablante nativo.
 */
export const qu: Partial<Record<Key, string>> = {
  'lang.label': 'Simi',
  data: 'Willakuykuna',
  loading: 'Suyay…',

  'nav.home': 'Qallariy',
  'nav.farm': 'Chakray',
  'nav.calendar': 'Killakuna',
  'nav.crop': 'Tarpuyniy',
  'nav.mars': 'Marte',

  // Meses: nombres del calendario inca
  'month.0': 'Qhapaq Raymi',
  'month.1': 'Hatun Puquy',
  'month.2': 'Pacha Puquy',
  'month.3': 'Ayriwa',
  'month.4': 'Aymuray',
  'month.5': 'Inti Raymi',
  'month.6': 'Anta Sitwa',
  'month.7': 'Chakra Yapuy',
  'month.8': 'Quya Raymi',
  'month.9': 'Uma Raymi',
  'month.10': "Aya Marq'ay",
  'month.11': 'Qhapaq Inti Raymi',

  'unit.days': "{n} p'unchaw",
  'unit.daysShort': "{n} p'",

  'home.greeting': 'Allillanchu',
  'home.title': "Ch'askakunata qhawaspa tarpuy",
  'home.start': 'Qallariy',
  'home.openCalendar': 'Killakunata qhaway',
  'home.sky': '🔭 Hanaq pachata qhaway',
  'home.marsTitle': 'Qullqa Martepi',
  'home.potatoTitle': 'Papakunap pachan',
  'status.ready': 'Allay pachaña!',
  'status.daysLeft': "{n} p'unchawraq",
  'status.sowNow': 'Kay killapi tarpuy!',
  'status.sowIn': '{month} killapi tarpuy',

  'incas.title': 'Inkakuna kayhinata ruraqku',
  'incas.1.title': 'Qullqata qhawaqku',
  'incas.2.title': 'Parawan tarpuqku',
  'incas.3.title': 'Allaqku, mikhuqku',
  'incas.4.title': 'Kunanqa NASAwan qhawanchis',

  'farm.title': 'Chakray',
  'farm.where': 'Maypitaq chakrayki?',
  'farm.variety': 'Ima papatataq tarpunki?',
  'farm.planted': 'Tarpurqankiñachu?',
  'farm.notYet': 'Manaraq',
  'farm.yesPlanted': 'Arí, tarpurqaniña',
  'farm.plantingDate': "Tarpusqa p'unchaw",

  'cal.title': 'Inka killakuna',
  'cal.whenSow': "🌱 Hayk'aq tarpusaq?",
  'cal.harvest': 'Allay',
  'light.good': 'Allin',
  'legend.today': 'Kunan',
  'stat.rain': 'Para',
  'stat.min': 'Chiri',
  'sowLabel.excellent': 'Ancha allin',
  'sowLabel.good': 'Allin',

  'crop.title': 'Tarpuyniy',
  'crop.plantedToday': 'Kunan tarpurqani',
  'crop.ringTop': 'Allaykama',
  'crop.ringBottom': "p'unchawraq",
  'crop.harvestNow': 'Allay pachaña!',

  'mars.title': 'Qullqa Martepi',
  'mars.growing': 'Papa wiñan!',

  'sky.title': 'Hanaq pachata inkakuna hina qhaway',
  'sky.modeNow': '🌙 Kunan',

  'pot.title': 'Papakunap pachan',
  'pot.tab.varieties': 'Papakuna',
  'pot.tab.planting': 'Tarpuy',
  'pot.tab.kitchen': 'Mikhuy',

  // --- Clima, tierras, mapa de papas y aportes
  'nav.lands': "Allpaykuna",
  'wx.now': "Kunan",
  'wx.wind': "Wayra",
  'wx.today': "Kunan",
  'wx.tomorrow': "Paqarin",
  'wx.rain': "Para",
  'wx.action.frost': "Qasa",
  'wx.action.noIrrigate': "Para",
  'lands.title': "Allpaykuna",
  'contrib.sent': "Sulpayki!",
  'tl.title': 'Tarpuymanta allaykama',
  'task.harvest.title': 'Allay',
  'chat.fab': 'Tapuy',
  'suit.good': 'Allin',
  'rotcrop.descanso': 'Samay (laymi)',
  'rotcrop.maiz': "Sara",
  'rotcrop.aji': "Uchu",
}

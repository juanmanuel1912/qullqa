/**
 * Mensajes motivadores para el agricultor, en español sencillo con toques de quechua.
 */
import type { StageId } from './crop';

export const QUECHUA = {
  greeting: 'Allillanchu',
  thanks: 'Sulpayki',
  potato: 'Papa',
  farm: 'Chakra',
  earth: 'Pachamama',
  sun: 'Inti',
  pleiades: 'Qullqa',
  rain: 'Para',
  community: 'Ayllu',
  harvest: 'Allay',
} as const;

const BY_STAGE: Record<StageId, string[]> = {
  sprouting: [
    'La Pachamama ya recibió tu semilla. ¡Buen comienzo!',
    'Como los incas, sembraste mirando el cielo. Ahora el satélite te acompaña.',
  ],
  growth: [
    'Tu chakra crece fuerte. Cada día suma.',
    'Wiñay: tu papa está creciendo. ¡Sigue así!',
  ],
  tuberization: [
    '¡Ya nacen las papitas bajo tierra! Es el momento más importante.',
    'Tu esfuerzo está floreciendo. Literalmente.',
  ],
  bulking: [
    'Las papas engordan día a día. Falta poco.',
    'La cosecha se acerca. Tu ayllu estará orgulloso.',
  ],
  maturation: [
    'Casi listo. Prepara los costales.',
    'Tu papa ya madura bajo el Inti.',
  ],
  harvest: [
    '¡Allay! Es tiempo de cosechar. Sulpayki, Pachamama.',
    '¡Lo lograste! Tu cosecha está lista.',
  ],
};

/** Mensaje estable para el día (no cambia en cada render). */
export function motivationFor(stage: StageId, today = new Date()): string {
  const list = BY_STAGE[stage];
  return list[today.getUTCDate() % list.length];
}

export const QULLQA_STORY =
  'Cada junio, los agricultores andinos miran las Pléyades (Qullqa) antes del amanecer. ' +
  'Si se ven grandes y brillantes, vendrán buenas lluvias y se siembra a tiempo. ' +
  'Si se ven opacas, se retrasa la siembra. Científicos confirmaron en 2000 que ese brillo ' +
  'depende de nubes altas ligadas a El Niño. Qullqa une esa sabiduría con los satélites de la NASA.';

/**
 * T2.5 — Simulador de Marte con la API del design.md. Delega en src/lib/mars/model.ts.
 */
import type { MarsEnvironment, MarsSimulationResult, PotatoVariety } from '../../types';
import { lightFactor, MARS, simulateMars, tempFactor } from '../mars/model';
import { CUSCO_CLIMATOLOGY, VARIETY_ID } from './potatoModel';
import { evaluateSowingMonth } from './sowing';

export { MARS, MARS_FACTS, MARS_PRESETS } from '../mars/model';

/** Superficie de Marte (NASA Mars Fact Sheet): −63 °C, 43 % de la luz terrestre. */
export const DEFAULT_MARS_ENVIRONMENT: MarsEnvironment = {
  temperature: -63,
  light: 43,
  water: 50,
};

/** Rango sugerido para los sliders. */
export const MARS_SLIDER_RANGES = {
  temperature: { min: -80, max: 35, step: 1 },
  light: { min: 0, max: 100, step: 1 },
  water: { min: 0, max: 100, step: 1 },
} as const;

/** GDD modificado por luz y temperatura. */
export function calculateMarsGDD(GDDBase: number, lightPercent: number, temperature: number): number {
  return GDDBase * lightFactor(lightPercent) * tempFactor(temperature);
}

/** Días de cultivo en la Tierra (Cusco, siembra en noviembre) para comparar. */
export function earthReferenceDays(variety: PotatoVariety): number {
  return evaluateSowingMonth(CUSCO_CLIMATOLOGY, VARIETY_ID[variety], 10, 2026).cycleDays ?? 160;
}

export function simulateMarsGrowth(environment: MarsEnvironment, variety: PotatoVariety): MarsSimulationResult {
  const r = simulateMars({
    tempC: environment.temperature,
    lightPct: environment.light,
    waterPct: environment.water,
    variety: VARIETY_ID[variety],
  });
  const earthDays = earthReferenceDays(variety);
  const days = r.earthDays ?? 0;
  const viability: MarsSimulationResult['viability'] = !r.viable
    ? 'not_viable'
    : days <= 130
      ? 'high'
      : days <= 220
        ? 'moderate'
        : 'low';

  const factor = r.viable && days > 0 ? Math.round((earthDays / days) * 100) / 100 : 0;
  let message: string;
  if (!r.viable) message = 'Con estas condiciones la papa no crece en Marte. Ajusta el invernadero.';
  else if (days < earthDays) message = `¡En Marte cosecharías en ${days} días, ${earthDays - days} días antes que en Cusco (${earthDays})!`;
  else if (days === earthDays) message = `En Marte tardaría lo mismo que en Cusco: ${days} días.`;
  else message = `En Marte tardaría ${days} días, ${days - earthDays} más que en Cusco (${earthDays}).`;

  return {
    environment,
    gddPerDay: Math.round((r.gddPerSol / MARS.solInEarthDays) * 100) / 100,
    daysToHarvest: days,
    viability,
    comparisonWithEarth: { accelerationFactor: factor, message },
    sols: r.sols,
    notes: r.notes,
  };
}

/**
 * Clasificación de El Niño / La Niña.
 * - Global (NOAA, ONI): ≥ +0,5 El Niño, ≤ −0,5 La Niña.
 *   Intensidad: débil < 1,0 · moderado < 1,5 · fuerte < 2,0 · muy fuerte ≥ 2,0
 * - Costero (Perú, ENFEN): índice ICEN = media de 3 meses de la anomalía Niño 1+2.
 *   Cálido: débil ≥ 0,4 · moderado ≥ 1,0 · fuerte ≥ 1,7 · extraordinario ≥ 3,0
 *   (Aquí se aproxima con los datos mensuales de NOAA; el oficial lo publica el ENFEN.)
 */
import type { Nino12Point, OniPoint } from '../../services/enso/noaa'

export type EnsoPhase = 'elnino' | 'lanina' | 'neutral'
export type EnsoStrength = 'weak' | 'moderate' | 'strong' | 'veryStrong'

export interface EnsoStatus {
  phase: EnsoPhase
  strength: EnsoStrength | null
  /** Último valor ONI y su trimestre */
  oni: OniPoint
  /** Tendencia del ONI respecto de 3 trimestres antes */
  trend: 'rising' | 'falling' | 'steady'
  /** Aproximación del ICEN (media de los últimos 3 meses de Niño 1+2) */
  coastal: number
  coastalPhase: EnsoPhase
  coastalStrength: EnsoStrength | null
  /** Último mes de Niño 1+2 */
  lastNino12: Nino12Point
}

export function oniStrength(a: number): EnsoStrength | null {
  const x = Math.abs(a)
  if (x < 0.5) return null
  if (x < 1) return 'weak'
  if (x < 1.5) return 'moderate'
  if (x < 2) return 'strong'
  return 'veryStrong'
}

export function coastalStrength(a: number): EnsoStrength | null {
  if (a >= 3) return 'veryStrong'
  if (a >= 1.7) return 'strong'
  if (a >= 1) return 'moderate'
  if (a >= 0.4) return 'weak'
  if (a <= -1.4) return 'strong' // fría fuerte
  if (a <= -1.2) return 'moderate'
  if (a <= -1) return 'weak'
  return null
}

export function ensoStatus(oni: OniPoint[], nino12: Nino12Point[]): EnsoStatus | null {
  if (oni.length === 0 || nino12.length < 3) return null
  const last = oni[oni.length - 1]
  const prev = oni[Math.max(0, oni.length - 4)]
  const diff = last.anom - prev.anom
  const phase: EnsoPhase = last.anom >= 0.5 ? 'elnino' : last.anom <= -0.5 ? 'lanina' : 'neutral'
  const lastThree = nino12.slice(-3)
  const coastal = Math.round((lastThree.reduce((s, p) => s + p.anom, 0) / 3) * 100) / 100
  const cs = coastalStrength(coastal)
  return {
    phase,
    strength: oniStrength(last.anom),
    oni: last,
    trend: diff > 0.3 ? 'rising' : diff < -0.3 ? 'falling' : 'steady',
    coastal,
    coastalPhase: coastal >= 0.4 ? 'elnino' : coastal <= -1 ? 'lanina' : 'neutral',
    coastalStrength: cs,
    lastNino12: nino12[nino12.length - 1],
  }
}

/** Eventos históricos importantes para el Perú. */
export const ENSO_HISTORY = [
  { years: '1982–83', kind: 'elnino' as const, strength: 'veryStrong' as const },
  { years: '1997–98', kind: 'elnino' as const, strength: 'veryStrong' as const },
  { years: '2010–11', kind: 'lanina' as const, strength: 'strong' as const },
  { years: '2015–16', kind: 'elnino' as const, strength: 'veryStrong' as const },
  { years: '2017', kind: 'elnino' as const, strength: 'strong' as const, coastal: true },
  { years: '2023', kind: 'elnino' as const, strength: 'strong' as const, coastal: true },
]

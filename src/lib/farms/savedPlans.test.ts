import { describe, expect, it } from 'vitest'
import { examplePlan, nextStep, stepSowDate, stepStatus } from './savedPlans'
import { addDays } from './history'

const today = '2026-11-14'

describe('planes guardados', () => {
  it('el ejemplo tiene una siembra en curso, 3 campañas y cultivos en descanso', () => {
    const p = examplePlan(today)
    expect(p.current?.crop).toBe('quinua')
    expect(p.steps).toHaveLength(3)
    expect(p.waits.map((w) => w.crop)).toContain('papa')
    // la primera siembra va después de la cosecha actual
    expect(stepSowDate(p.steps[0]) >= p.current!.harvestDate.slice(0, 8) + '01').toBe(true)
  })

  it('el próximo paso es el primero sin sembrar', () => {
    const p = examplePlan(today)
    expect(nextStep(p, today)?.index).toBe(0)
    expect(stepStatus(p, 0, today)).toBe('soon')
    expect(stepStatus(p, 1, today)).toBe('later')
    const done = { ...p, steps: p.steps.map((s, i) => (i === 0 ? { ...s, doneDate: today } : s)) }
    expect(nextStep(done, today)?.index).toBe(1)
    expect(stepStatus(done, 0, today)).toBe('done')
  })

  it('avisa cuando ya toca sembrar', () => {
    const p = examplePlan(today)
    const near = addDays(stepSowDate(p.steps[0]), -5)
    expect(stepStatus(p, 0, near)).toBe('now')
  })
})

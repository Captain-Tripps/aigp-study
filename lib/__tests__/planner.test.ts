import { describe, it, expect } from 'vitest'
import { generatePlan } from '../planner'

describe('generatePlan', () => {
  it('should generate 8-12 weeks of plan', () => {
    const examDate = new Date('2026-12-01')
    const plan = generatePlan(examDate, 10)
    expect(plan.totalWeeks).toBeGreaterThanOrEqual(8)
    expect(plan.totalWeeks).toBeLessThanOrEqual(12)
    expect(plan.weeks.length).toBe(plan.totalWeeks)
  })

  it('should distribute all 7 modules across weeks', () => {
    const examDate = new Date('2026-12-01')
    const plan = generatePlan(examDate, 10)
    const allModules = new Set(plan.weeks.flatMap((w) => w.modules.map((m) => m.number)))
    expect(allModules.size).toBe(7)
  })

  it('should set domain milestones with increasing readiness', () => {
    const examDate = new Date('2026-12-01')
    const plan = generatePlan(examDate, 10)
    const lastWeek = plan.weeks[plan.weeks.length - 1]
    const domainI = lastWeek.domainMilestones.find((m) => m.romanNumeral === 'I')
    expect(domainI).toBeDefined()
    expect(domainI!.targetReadiness).toBeGreaterThanOrEqual(80)
  })

  it('should respect weekly hours', () => {
    const examDate = new Date('2026-12-01')
    const plan = generatePlan(examDate, 8)
    expect(plan.weeklyHours).toBe(8)
  })
})

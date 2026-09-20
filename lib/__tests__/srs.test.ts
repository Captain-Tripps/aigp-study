import { describe, it, expect } from 'vitest'
import { sm2, isDue } from '../srs'

describe('sm2', () => {
  it('should increase interval for good answer (quality 4)', () => {
    const result = sm2(2.5, 0, 4)
    expect(result.interval).toBe(1)
    expect(result.easeFactor).toBe(2.5)
  })

  it('should increase interval further on second good answer', () => {
    const result = sm2(2.5, 1, 4)
    expect(result.interval).toBe(6)
  })

  it('should reset interval for failed answer (quality 0)', () => {
    const result = sm2(2.5, 6, 0)
    expect(result.interval).toBe(1)
    expect(result.easeFactor).toBeLessThan(2.5)
  })

  it('should decrease ease factor for quality < 3', () => {
    const result = sm2(2.5, 6, 2)
    expect(result.easeFactor).toBeLessThan(2.5)
    expect(result.interval).toBe(1)
  })

  it('should maintain ease factor for quality >= 3', () => {
    const result = sm2(2.5, 6, 4)
    expect(result.easeFactor).toBe(2.5)
  })

  it('should not go below 1.3 for ease factor', () => {
    const result = sm2(1.3, 6, 0)
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
  })
})

describe('isDue', () => {
  it('should return true for null date', () => {
    expect(isDue(null)).toBe(true)
  })

  it('should return true for past date', () => {
    expect(isDue(new Date(Date.now() - 86400000))).toBe(true)
  })

  it('should return false for future date', () => {
    expect(isDue(new Date(Date.now() + 86400000))).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { validateConfidence } from '../progress-utils'

describe('validateConfidence', () => {
  it('should clamp to 0-5', () => {
    expect(validateConfidence(-1)).toBe(0)
    expect(validateConfidence(6)).toBe(5)
    expect(validateConfidence(3.7)).toBe(4)
  })

  it('should return integers', () => {
    expect(validateConfidence(2.4)).toBe(2)
    expect(validateConfidence(4.6)).toBe(5)
  })
})

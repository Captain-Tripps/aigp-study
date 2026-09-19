import { describe, it, expect } from 'vitest'
import { romanToNumber } from '../pdf-parser'

describe('romanToNumber', () => {
  it('should convert roman numerals', () => {
    expect(romanToNumber('I')).toBe(1)
    expect(romanToNumber('II')).toBe(2)
    expect(romanToNumber('IV')).toBe(4)
    expect(romanToNumber('VII')).toBe(7)
    expect(romanToNumber('X')).toBe(10)
  })
})

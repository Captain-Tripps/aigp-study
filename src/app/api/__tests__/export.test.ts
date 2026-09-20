import { describe, it, expect } from 'vitest'

describe('Export API', () => {
  it('should be importable', async () => {
    const mod = await import('../export/route')
    expect(mod.GET).toBeDefined()
  })
})

describe('Import API', () => {
  it('should be importable and define POST', async () => {
    const mod = await import('../import/route')
    expect(mod.POST).toBeDefined()
    expect(typeof mod.POST).toBe('function')
  })
})

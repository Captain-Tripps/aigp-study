import { describe, it, expect } from 'vitest'

describe('Export API', () => {
  it('should be importable', async () => {
    const mod = await import('../export/route')
    expect(mod.GET).toBeDefined()
  })
})

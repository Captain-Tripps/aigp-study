import { describe, it, expect } from 'vitest'

describe('Revisions collection API', () => {
  it('should be importable and define GET and POST', async () => {
    const mod = await import('../content/[chunkId]/revisions/route')
    expect(mod.GET).toBeDefined()
    expect(typeof mod.GET).toBe('function')
    expect(mod.POST).toBeDefined()
    expect(typeof mod.POST).toBe('function')
  })
})

describe('Single revision API', () => {
  it('should be importable and define GET and PUT', async () => {
    const mod = await import(
      '../content/[chunkId]/revisions/[revisionId]/route'
    )
    expect(mod.GET).toBeDefined()
    expect(typeof mod.GET).toBe('function')
    expect(mod.PUT).toBeDefined()
    expect(typeof mod.PUT).toBe('function')
  })
})

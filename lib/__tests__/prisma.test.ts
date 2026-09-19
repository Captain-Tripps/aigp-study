import { describe, it, expect } from 'vitest'
import { prisma } from '../prisma'

describe('Prisma client', () => {
  it('should be a singleton', async () => {
    const { prisma: p2 } = await import('../prisma')
    expect(p2).toBe(prisma)
  })

  it('should have seeded exam domains', async () => {
    const domains = await prisma.examDomain.findMany()
    expect(domains).toHaveLength(4)
    expect(domains.map((d) => d.romanNumeral)).toEqual(['I', 'II', 'III', 'IV'])
  })

  it('should have seeded training modules', async () => {
    const modules = await prisma.trainingModule.findMany({ orderBy: { sortOrder: 'asc' } })
    expect(modules).toHaveLength(7)
    expect(modules[0].title).toContain('Foundations')
    expect(modules[6].title).toContain('Deployment')
  })
})

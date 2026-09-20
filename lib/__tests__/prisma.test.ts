import { describe, it, expect, vi } from 'vitest'

// Mock the prisma module so these tests never touch a real database.
vi.mock('../prisma', () => {
  const mockPrisma = {
    examDomain: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    trainingModule: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    $disconnect: vi.fn(),
  }
  return { prisma: mockPrisma }
})

import { prisma } from '../prisma'

describe('Prisma client', () => {
  it('should be a singleton', async () => {
    const { prisma: p2 } = await import('../prisma')
    expect(p2).toBe(prisma)
  })

  it('should expose examDomain delegate', () => {
    expect(prisma.examDomain).toBeDefined()
    expect(prisma.examDomain.findMany).toBeDefined()
  })

  it('should expose trainingModule delegate', () => {
    expect(prisma.trainingModule).toBeDefined()
    expect(prisma.trainingModule.findMany).toBeDefined()
  })
})

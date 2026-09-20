import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockData = {
  examDomains: [
    { id: 1, romanNumeral: 'I', title: 'Foundations', weightMin: 16, weightMax: 20, description: 'test' },
  ],
  trainingModules: [
    { id: 1, number: 1, title: 'Module 1', description: 'test', sortOrder: 1 },
  ],
}

const mockPrisma = {
  examDomain: {
    findMany: vi.fn().mockResolvedValue(mockData.examDomains),
    upsert: vi.fn().mockImplementation(({ create }: { create: Record<string, unknown> }) =>
      Promise.resolve({ id: 999, ...create }),
    ),
  },
  trainingModule: {
    findMany: vi.fn().mockResolvedValue(mockData.trainingModules),
    upsert: vi.fn().mockImplementation(({ create }: { create: Record<string, unknown> }) =>
      Promise.resolve({ id: 999, ...create }),
    ),
  },
  userProgress: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() },
  question: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() },
  questionAttempt: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() },
  flashcard: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() },
  contentChunk: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() },
  studyPlan: {
    findFirst: vi.fn().mockResolvedValue(null),
    update: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn((fn: () => Promise<unknown>) => fn()),
}

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const { GET } = await import('../export/route')
const { POST } = await import('../import/route')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Export/Import API round-trip', () => {
  it('GET /api/export returns all collections', async () => {
    const res = await GET()
    const json = await res.json()

    expect(json.examDomains).toEqual(mockData.examDomains)
    expect(json.trainingModules).toEqual(mockData.trainingModules)
    expect(json.userProgress).toEqual([])
    expect(json.questions).toEqual([])
    expect(json.questionAttempts).toEqual([])
    expect(json.flashcards).toEqual([])
    expect(json.contentChunks).toEqual([])
    expect(json.studyPlan).toBeNull()
  })

  it('POST /api/import handles the happy path via $transaction', async () => {
    const res = await POST(new Request('http://localhost/api/import', {
      method: 'POST',
      body: JSON.stringify({
        examDomains: mockData.examDomains,
        trainingModules: mockData.trainingModules,
      }),
    }))

    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.counts.examDomains).toBe(1)
    expect(json.counts.trainingModules).toBe(1)
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
  })
})

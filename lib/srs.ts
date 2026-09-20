export interface SRSResult {
  easeFactor: number
  interval: number
}

export function sm2(easeFactor: number, interval: number, quality: number): SRSResult {
  if (quality < 3) {
    return {
      easeFactor: Math.max(1.3, easeFactor - 0.2),
      interval: 1,
    }
  }

  let newInterval: number
  if (interval === 0) newInterval = 1
  else if (interval === 1) newInterval = 6
  else newInterval = Math.round(interval * easeFactor)

  let newEF = easeFactor
  if (quality === 3) newEF = easeFactor
  else newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  return {
    easeFactor: Math.max(1.3, newEF),
    interval: newInterval,
  }
}

export function calculateDueDate(intervalDays: number, from?: Date): Date {
  const base = from || new Date()
  const due = new Date(base)
  due.setDate(due.getDate() + intervalDays)
  return due
}

export function isDue(nextReviewDate: Date | null): boolean {
  if (!nextReviewDate) return true
  return nextReviewDate <= new Date()
}

export interface WeekPlan {
  week: number
  startDate: Date
  endDate: Date
  modules: { number: number; title: string; hours: number }[]
  domainMilestones: { romanNumeral: string; targetReadiness: number }[]
  dailyHours: number
}

export interface StudyPlanData {
  examDate: Date
  weeklyHours: number
  startDate: Date
  totalWeeks: number
  weeks: WeekPlan[]
}

const MODULE_TITLES: Record<number, string> = {
  1: 'Foundations of AI',
  2: 'AI Impacts & Principles',
  3: 'AI Governance & Risk Mgmt',
  4: 'AI Regulation',
  5: 'Other Laws for AI',
  6: 'Governing AI Development',
  7: 'Governing AI Deployment',
}

const WEEK_MODULE_DISTRIBUTION = [1, 1, 1, 2, 2, 3, 4, 5, 6, 7]

const DOMAIN_WEIGHTS: Record<string, number> = {
  I: 18,
  II: 20,
  III: 30,
  IV: 30,
}

export function generatePlan(examDate: Date, weeklyHours: number): StudyPlanData {
  const totalWeeks = 10
  const startDate = new Date(examDate)
  startDate.setDate(startDate.getDate() - totalWeeks * 7)

  const dailyHours = weeklyHours / 7

  const weeks: WeekPlan[] = []

  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = new Date(startDate)
    weekStart.setDate(weekStart.getDate() + w * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const moduleNumber = WEEK_MODULE_DISTRIBUTION[w]
    const modules = [{
      number: moduleNumber,
      title: MODULE_TITLES[moduleNumber],
      hours: weeklyHours,
    }]

    const progress = (w + 1) / totalWeeks
    const domainMilestones = Object.entries(DOMAIN_WEIGHTS).map(([roman, weight]) => ({
      romanNumeral: roman,
      targetReadiness: Math.min(100, Math.round(progress * (100 + weight))),
    }))

    weeks.push({
      week: w + 1,
      startDate: weekStart,
      endDate: weekEnd,
      modules,
      domainMilestones,
      dailyHours,
    })
  }

  return { examDate, weeklyHours, startDate, totalWeeks, weeks }
}

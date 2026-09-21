'use client'

import { useEffect, useState, useCallback } from 'react'
import { QuestionCard } from '@/components/practice/QuestionCard'

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
  source: string
  difficulty: string
  examDomain: { romanNumeral: string; title: string }
  trainingModule: { number: number; title: string } | null
  performanceIndicator: { code: string; description: string } | null
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [domain, setDomain] = useState('')
  const [module, setModule] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [answered, setAnswered] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (domain) params.set('domain', domain)
    if (module) params.set('module', module)
    if (difficulty) params.set('difficulty', difficulty)
    const res = await fetch(`/api/questions?${params}`)
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      setError(err?.error || `Request failed (HTTP ${res.status})`)
      setLoading(false)
      return
    }
    const data = await res.json()
    setQuestions(data.questions)
    setCurrentIndex(0)
    setAnswered({ correct: 0, total: 0 })
    setLoading(false)
  }, [domain, module, difficulty])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentIndex]
    if (!q) return
    const correct = selectedIndex === q.correctAnswer
    setAnswered((prev) => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }))
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
  }

  const currentQ = questions[currentIndex]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Practice Questions</h1>
        <p className="text-clay-text/50">
          {answered.total > 0
            ? `${answered.correct}/${answered.total} correct (${Math.round((answered.correct / answered.total) * 100)}%)`
            : 'Test your knowledge across all exam domains'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={domain} onChange={(e) => setDomain(e.target.value)} className="clay-input">
          <option value="">All domains</option>
          <option value="I">Domain I</option>
          <option value="II">Domain II</option>
          <option value="III">Domain III</option>
          <option value="IV">Domain IV</option>
        </select>
        <select value={module} onChange={(e) => setModule(e.target.value)} className="clay-input">
          <option value="">All modules</option>
          {[1,2,3,4,5,6,7].map((n) => <option key={n} value={n}>Module {n}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="clay-input">
          <option value="">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={loadQuestions} className="clay-btn">
          Search
        </button>
      </div>

      {error ? (
        <div className="clay-card text-center">
          <p className="text-clay-danger">{error}</p>
          <button onClick={loadQuestions} className="clay-btn mt-3">
            Retry
          </button>
        </div>
      ) : currentQ ? (
        <div className="space-y-4">
          <p className="text-sm text-clay-text/50">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <QuestionCard key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />
          {answered.total > 0 && currentIndex < questions.length - 1 && (
            <button
              onClick={nextQuestion}
              className="clay-btn"
            >
              Next Question
            </button>
          )}
          {answered.total > 0 && currentIndex === questions.length - 1 && (
            <div className="clay-card">
              <h2 className="text-lg font-semibold text-clay-text">Session Complete</h2>
              <p className="mt-1 text-sm text-clay-text/70">
                Score: {answered.correct}/{answered.total} ({Math.round((answered.correct / answered.total) * 100)}%)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="clay-card text-clay-text/50">
          {loading ? 'Loading...' : 'No questions found for the selected filters.'}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CompetencyTree } from '@/components/study/CompetencyTree'
import { ContentPanel } from '@/components/study/ContentPanel'
import { ProgressActions } from '@/components/study/ProgressActions'
import type { ModuleDetail, PIDetail } from '@/types/study'

function AddContentForm({ piId, onAdded, onBack }: { piId: number; onAdded: () => void; onBack: () => void }) {
  const [type, setType] = useState('article')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSubmitError(null)
    try {
      const r = await fetch('/api/content/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performanceIndicatorId: piId, type, title, content }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => null)
        setSubmitError(err?.error || `Failed to add content (HTTP ${r.status})`)
        return
      }
      onAdded()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add content')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="clay-card-sm space-y-4">
      <h3 className="text-sm font-semibold text-clay-text">Add content</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-clay-text/70">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="clay-input mt-1 block">
            <option value="article">article</option>
            <option value="note">note</option>
            <option value="resource">resource</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-clay-text/70">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="clay-input mt-1 block w-full"
            placeholder="Content title"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-clay-text/70">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="clay-input mt-1 block w-full"
            rows={6}
            placeholder="Content"
            required
          />
        </div>
        {submitError && <p className="text-clay-danger text-sm">{submitError}</p>}
        <div className="flex gap-2">
          <button type="submit" className="clay-btn disabled:opacity-50" disabled={saving}>
            {saving ? 'Saving...' : 'Add Content'}
          </button>
          <button type="button" onClick={onBack} className="clay-btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ModuleDetailPage() {
  const { number } = useParams()
  const [module, setModule] = useState<ModuleDetail | null>(null)
  const [selectedPI, setSelectedPI] = useState<PIDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addingContent, setAddingContent] = useState(false)

  const load = () => {
    setError(null)
    fetch(`/api/study/modules/${number}`)
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => null)
          setError(err?.error || `Failed to load (HTTP ${r.status})`)
          return
        }
        setModule(await r.json())
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => { load() }, [number])

  if (error) {
    return (
      <div className="clay-card text-center">
        <p className="text-clay-danger">{error}</p>
        <button onClick={load} className="clay-btn mt-3">
          Retry
        </button>
      </div>
    )
  }
  if (!module) return <p className="text-clay-text/50">Loading...</p>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-clay-primary">Module {module.number}</p>
        <h1 className="text-2xl font-bold text-clay-text">{module.title}</h1>
        <p className="mt-1 text-clay-text/70">{module.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CompetencyTree
            competencies={module.competencies}
            selectedPI={selectedPI?.id ?? null}
            onSelectPI={setSelectedPI}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedPI ? (
            selectedPI.chunks.length === 0 ? (
              addingContent ? (
                <AddContentForm
                  piId={selectedPI.id}
                  onAdded={() => {
                    setAddingContent(false)
                    load()
                  }}
                  onBack={() => setAddingContent(false)}
                />
              ) : (
                <div className="clay-card text-center text-clay-text/50">
                  <p>No content yet. Add study content for this performance indicator.</p>
                  <button onClick={() => setAddingContent(true)} className="clay-btn mt-3">
                    Add Content
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-clay-text">
                  <span className="font-mono font-medium text-clay-primary">{selectedPI.code}</span> — {selectedPI.description}
                </h2>
                <ContentPanel chunks={selectedPI.chunks} />
                <ProgressActions
                  piId={selectedPI.id}
                  progress={selectedPI.progress}
                  onUpdated={(p) => setSelectedPI((prev) => prev ? { ...prev, progress: p } : null)}
                />
              </div>
            )
          ) : (
            <div className="clay-card text-center text-clay-text/50">
              Select a performance indicator to view content
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

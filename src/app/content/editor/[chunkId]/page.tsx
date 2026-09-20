'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { RichEditor } from '@/components/editor/RichEditor'
import { MetadataPanel } from '@/components/editor/MetadataPanel'
import { RevisionHistory } from '@/components/editor/RevisionHistory'

interface ContentChunkDetail {
  id: number
  type: string
  title: string
  content: string
  sourcePage: number | null
  sourceUrl: string | null
  sourceType: string
  isEdited: boolean
  editedContent: string | null
  editedAt: string | null
  metadata: string | null
  performanceIndicator: { code: string; description: string }
}

interface Metadata {
  videoId?: string
  startTime?: number
  endTime?: number
  tags?: string[]
  relatedPis?: string[]
}

export default function ContentEditorPage() {
  const { chunkId } = useParams()
  const [chunk, setChunk] = useState<ContentChunkDetail | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [metadata, setMetadata] = useState<Metadata>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    fetch(`/api/content/${chunkId}`)
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => null)
          setError(err?.error || `Failed to load (HTTP ${r.status})`)
          return
        }
        const data = await r.json()
        setChunk(data)
        setEditedContent(data.editedContent || data.content)
        if (data.metadata) {
          try {
            setMetadata(JSON.parse(data.metadata))
          } catch {
            /* ignore */
          }
        }
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => { load() }, [chunkId])

  const save = async () => {
    if (!chunk) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/content/${chunk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editedContent, metadata }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      setError(err?.error || `Request failed (HTTP ${res.status})`)
      setSaving(false)
      return
    }
    setSaving(false)
    load()
  }

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
  if (!chunk) return <p className="text-clay-text/50">Loading...</p>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-clay-primary">
          {chunk.performanceIndicator.code} — {chunk.performanceIndicator.description}
        </p>
        <h1 className="text-2xl font-bold text-clay-text">{chunk.title}</h1>
        {chunk.sourcePage && (
          <p className="text-sm text-clay-text/50">Source: PDF page {chunk.sourcePage}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RichEditor initialContent={editedContent} onChange={setEditedContent} />
        </div>
        <div className="space-y-4">
          <MetadataPanel metadata={metadata} onChange={setMetadata} />
          <button
            onClick={save}
            disabled={saving}
            className="clay-btn w-full disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <RevisionHistory chunkId={chunk.id} onReverted={load} />
        </div>
      </div>
    </div>
  )
}

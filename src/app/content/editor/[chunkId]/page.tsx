'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { RichEditor } from '@/components/editor/RichEditor'
import { MetadataPanel } from '@/components/editor/MetadataPanel'

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
    await fetch(`/api/content/${chunk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editedContent, metadata }),
    })
    setSaving(false)
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
        <p className="text-red-600">{error}</p>
        <button onClick={load} className="mt-3 rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
          Retry
        </button>
      </div>
    )
  }
  if (!chunk) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          {chunk.performanceIndicator.code} — {chunk.performanceIndicator.description}
        </p>
        <h1 className="text-2xl font-bold">{chunk.title}</h1>
        {chunk.sourcePage && (
          <p className="text-sm text-gray-500">Source: PDF page {chunk.sourcePage}</p>
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
            className="w-full rounded bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

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

  useEffect(() => {
    fetch(`/api/content/${chunkId}`)
      .then((r) => r.json())
      .then((data) => {
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
  }, [chunkId])

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

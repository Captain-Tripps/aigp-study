interface Metadata {
  videoId?: string
  startTime?: number
  endTime?: number
  tags?: string[]
  relatedPis?: string[]
}

export function MetadataPanel({
  metadata,
  onChange,
}: {
  metadata: Metadata
  onChange: (m: Metadata) => void
}) {
  const update = (key: string, value: unknown) => {
    onChange({ ...metadata, [key]: value })
  }

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Metadata</h3>

      <div>
        <label className="text-xs font-medium text-gray-600">Video ID</label>
        <input
          type="text"
          value={metadata.videoId || ''}
          onChange={(e) => update('videoId', e.target.value)}
          placeholder="YouTube video ID"
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-600">Start (s)</label>
          <input
            type="number"
            value={metadata.startTime || 0}
            onChange={(e) => update('startTime', parseInt(e.target.value, 10))}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">End (s)</label>
          <input
            type="number"
            value={metadata.endTime || 0}
            onChange={(e) => update('endTime', parseInt(e.target.value, 10))}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Tags (comma-separated)</label>
        <input
          type="text"
          value={(metadata.tags || []).join(', ')}
          onChange={(e) =>
            update('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))
          }
          placeholder="eu-ai-act, nist-rmf, genai"
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
        />
      </div>
    </div>
  )
}

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import type { ChunkDetail } from '@/types/study'

export function ContentPanel({ chunks }: { chunks: ChunkDetail[] }) {
  if (chunks.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
        No content chunks for this performance indicator yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {chunks.map((chunk) => (
        <div key={chunk.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">{chunk.title}</h4>
            <div className="flex items-center gap-2">
              {chunk.sourcePage && (
                <span className="text-xs text-gray-400">p.{chunk.sourcePage}</span>
              )}
              {chunk.isEdited && (
                <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                  edited
                </span>
              )}
              <Link
                href={`/content/editor/${chunk.id}`}
                className="rounded border px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Edit
              </Link>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{chunk.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  )
}

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import type { ChunkDetail } from '@/types/study'

export function ContentPanel({ chunks }: { chunks: ChunkDetail[] }) {
  if (chunks.length === 0) {
    return (
      <div className="clay-card text-center text-sm text-clay-text/50">
        No content chunks for this performance indicator yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {chunks.map((chunk) => (
        <div key={chunk.id} className="clay-card-sm">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-clay-text">{chunk.title}</h4>
            <div className="flex items-center gap-2">
              {chunk.sourcePage && (
                <span className="text-xs text-clay-text/40">p.{chunk.sourcePage}</span>
              )}
              {chunk.sourceType === 'article' && chunk.sourceUrl && (
                <a
                  href={chunk.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-clay-primary hover:underline"
                >
                  Source
                </a>
              )}
              {chunk.isEdited && (
                <span className="clay-badge bg-clay-warning/10 text-clay-warning">
                  edited
                </span>
              )}
              <Link
                href={`/content/editor/${chunk.id}`}
                className="clay-btn-secondary rounded-clay-xs px-3 py-1 text-xs"
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

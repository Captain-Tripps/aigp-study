'use client'

import { useCallback, useEffect, useState } from 'react'

interface Revision {
  id: number
  editedContent: string
  metadata: string | null
  previousContent: string
  createdAt: string
}

export function RevisionHistory({
  chunkId,
  onReverted,
}: {
  chunkId: number
  onReverted?: () => void
}) {
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [reverting, setReverting] = useState<number | null>(null)

  const load = useCallback(() => {
    fetch(`/api/content/${chunkId}/revisions`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setRevisions)
      .catch(() => setRevisions([]))
  }, [chunkId])

  useEffect(() => {
    load()
  }, [load])

  const revert = async (revisionId: number) => {
    setReverting(revisionId)
    await fetch(`/api/content/${chunkId}/revisions/${revisionId}`, {
      method: 'PUT',
    })
    setReverting(null)
    load()
    onReverted?.()
  }

  return (
    <div className="clay-card-sm space-y-3">
      <h3 className="text-sm font-semibold text-clay-text">History</h3>

      {revisions.length === 0 ? (
        <p className="text-sm text-clay-text/50">No revisions yet</p>
      ) : (
        <ul className="space-y-2">
          {revisions.map((rev) => (
            <li key={rev.id} className="rounded-clay-xs bg-clay-bg/50 p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-clay-text/70">
                  {new Date(rev.createdAt).toLocaleString()}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-clay-xs bg-clay-primary/10 px-2 py-0.5 text-xs font-semibold text-clay-primary transition-colors hover:bg-clay-primary/20 cursor-pointer"
                    onClick={() =>
                      setExpanded(expanded === rev.id ? null : rev.id)
                    }
                  >
                    View
                  </button>
                  <button
                    type="button"
                    disabled={reverting === rev.id}
                    className="rounded-clay-xs bg-clay-danger/10 px-2 py-0.5 text-xs font-semibold text-clay-danger transition-colors hover:bg-clay-danger/20 disabled:opacity-50 cursor-pointer"
                    onClick={() => revert(rev.id)}
                  >
                    {reverting === rev.id ? 'Reverting...' : 'Revert'}
                  </button>
                </div>
              </div>

              {expanded === rev.id && (
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-clay-text/60">
                      Previous
                    </p>
                    <div
                      className="prose prose-sm max-w-none rounded-clay-xs bg-white p-2 text-clay-text"
                      dangerouslySetInnerHTML={{ __html: rev.previousContent }}
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-clay-text/60">
                      New
                    </p>
                    <div
                      className="prose prose-sm max-w-none rounded-clay-xs bg-white p-2 text-clay-text"
                      dangerouslySetInnerHTML={{ __html: rev.editedContent }}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

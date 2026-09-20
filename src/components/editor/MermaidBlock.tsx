'use client'

import { useEffect, useRef, useState } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react'

let idCounter = 0
function nextId() {
  idCounter += 1
  return `mermaid-${Date.now()}-${idCounter}`
}

function MermaidView({ node, selected }: { node: { attrs: { code?: string } }; selected: boolean }) {
  const code = node.attrs.code ?? ''
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editing = selected || code.trim() === ''

  useEffect(() => {
    if (editing || code.trim() === '') return
    let cancelled = false
    setRendering(true)
    setError(null)
    const run = async () => {
      try {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'neutral' })
        const { svg } = await mermaid.render(nextId(), code)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Invalid Mermaid diagram')
      } finally {
        if (!cancelled) setRendering(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [code, editing])

  if (editing) {
  return (
    <div className="my-3 rounded-clay-sm border-2 border-dashed border-clay-primary/40 bg-white p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-clay-primary/70">
          Mermaid diagram
        </p>
        <div className="w-full min-h-[80px] resize-y overflow-auto rounded-clay-xs bg-clay-bg/40 p-2 font-mono text-xs text-clay-text">
          <NodeViewContent className="ProseMirror h-full w-full font-mono text-xs text-clay-text outline-none" />
        </div>
      </div>
  )
  }

  return (
    <div className="mermaid-block my-3 overflow-x-auto rounded-clay-sm border border-clay-primary/20 bg-white p-3">
      {error ? (
        <pre className="whitespace-pre-wrap font-mono text-xs text-clay-danger">{error}</pre>
      ) : (
        <div ref={containerRef} className="mermaid-svg flex justify-center" />
      )}
      {rendering && <span className="text-xs text-clay-text/40">Rendering…</span>}
    </div>
  )
}

export const MermaidBlock = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  content: 'text*',
  atom: true,
  selectable: true,
  draggable: false,
  isolating: true,

  addAttributes() {
    return {
      code: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-mermaid-code') ?? el.textContent ?? '',
        renderHTML: (attrs) =>
          attrs.code ? { 'data-mermaid-code': attrs.code } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-mermaid]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-mermaid': '',
        'data-mermaid-code': node.attrs.code ?? '',
      }),
      node.attrs.code ?? '',
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidView)
  },

  addCommands() {
    return {
      insertMermaidBlock: (code = '') => ({ chain }) =>
        chain().insertContent({ type: this.name, attrs: { code } }).run(),
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaidBlock: {
      insertMermaidBlock: (code?: string) => ReturnType
    }
  }
}

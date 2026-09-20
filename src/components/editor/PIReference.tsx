'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Link from 'next/link'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    piReference: {
      insertPIReference: (code: string) => ReturnType
    }
  }
}

export function getModuleNumber(code: string): string | null {
  const match = code.match(/^PI-(\d+)/)
  return match ? match[1] : null
}

function PIReferenceView({ node }: { node: { attrs: { code?: string } } }) {
  const code = node.attrs.code ?? ''
  const moduleNumber = getModuleNumber(code)
  const badgeClass =
    'inline-flex items-center rounded-clay-xs bg-clay-primary/10 px-2 py-0.5 ' +
    'font-mono text-xs font-semibold text-clay-primary'

  if (moduleNumber) {
    return (
      <Link href={`/study/modules/${moduleNumber}`} className={badgeClass}>
        {code}
      </Link>
    )
  }
  return <span className={badgeClass}>{code}</span>
}

export const PIReference = Node.create({
  name: 'piReference',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      code: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-pi-code') ?? '',
        renderHTML: (attrs) => (attrs.code ? { 'data-pi-code': attrs.code } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-pi-ref]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-pi-ref': '',
        class:
          'inline-flex items-center rounded-clay-xs bg-clay-primary/10 px-2 py-0.5 ' +
          'font-mono text-xs font-semibold text-clay-primary',
      }),
      node.attrs.code ?? '',
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PIReferenceView)
  },

  addCommands() {
    return {
      insertPIReference: (code: string) => ({ chain, editor }) =>
        chain()
          .insertContent([
            { type: this.name, attrs: { code } },
            { type: 'text', text: ' ' },
          ])
          .focus(editor.state.selection.to + 1)
          .run(),
    }
  },
})

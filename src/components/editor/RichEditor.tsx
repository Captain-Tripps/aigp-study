'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import YouTube from '@tiptap/extension-youtube'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { Mathematics } from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'

import { CalloutBlock, CALLOUT_TYPES, type CalloutType } from './CalloutBlock'
import { PIReference } from './PIReference'
import { MermaidBlock } from './MermaidBlock'

const TOOLBAR_BTN =
  'rounded-clay-xs px-2.5 py-1 text-xs font-semibold text-clay-text transition-colors ' +
  'cursor-pointer hover:bg-clay-primary/10'

export function RichEditor({
  initialContent,
  onChange,
}: {
  initialContent: string
  onChange: (html: string) => void
}) {
  const [calloutType, setCalloutType] = useState<CalloutType>('info')

  const editor = useEditor({
    extensions: [
      StarterKit,
      YouTube.configure({ controls: true }),
      Link.configure({ openOnClick: false }),
      Highlight,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Mathematics.configure({ katexOptions: { throwOnError: false } }),
      CalloutBlock,
      PIReference,
      MermaidBlock,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] px-3 py-2 text-clay-text',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const insertCallout = (type: CalloutType) => {
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'calloutBlock',
          attrs: { type },
          content: [{ type: 'paragraph' }],
        },
      ])
      .run()
  }

  const insertMath = (block: boolean) => {
    const latex = window.prompt(block ? 'LaTeX (block):' : 'LaTeX (inline):', 'x^2')
    if (!latex) return
    if (block) {
      editor.chain().focus().insertBlockMath({ latex }).run()
    } else {
      editor.chain().focus().insertInlineMath({ latex }).run()
    }
  }

  const insertPIRef = () => {
    const code = window.prompt('PI code (e.g. PI-1.2.3):', '')
    if (!code || !code.trim()) return
    editor.chain().focus().insertPIReference(code.trim()).run()
  }

  const insertDiagram = () => {
    editor
      .chain()
      .focus()
      .insertMermaidBlock('%% Mermaid diagram — edit the code here')
      .run()
  }

  return (
    <div
      className="rounded-clay bg-white"
      style={{
        boxShadow:
          'inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-clay-primary/10 px-2 py-1.5">
        <span className="mr-1 text-xs font-semibold text-clay-text/50">Insert</span>

        <button className={TOOLBAR_BTN} onClick={() => insertCallout(calloutType)} type="button">
          Callout
        </button>
        <select
          className="rounded-clay-xs border-0 bg-clay-bg/50 px-1.5 py-1 text-xs text-clay-text outline-none"
          value={calloutType}
          onChange={(e) => setCalloutType(e.target.value as CalloutType)}
          aria-label="Callout type"
        >
          {CALLOUT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button className={TOOLBAR_BTN} onClick={() => insertMath(false)} type="button">
          Math
        </button>
        <button className={TOOLBAR_BTN} onClick={() => insertMath(true)} type="button">
          Block Math
        </button>

        <button className={TOOLBAR_BTN} onClick={insertPIRef} type="button">
          PI Ref
        </button>

        <button className={TOOLBAR_BTN} onClick={insertDiagram} type="button">
          Diagram
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

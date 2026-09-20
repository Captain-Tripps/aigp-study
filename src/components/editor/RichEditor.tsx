'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import YouTube from '@tiptap/extension-youtube'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'

export function RichEditor({
  initialContent,
  onChange,
}: {
  initialContent: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      YouTube.configure({ controls: true }),
      Link.configure({ openOnClick: false }),
      Highlight,
      Placeholder.configure({ placeholder: 'Start writing...' }),
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

  return (
    <div
      className="rounded-clay bg-white"
      style={{
        boxShadow:
          'inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )
}

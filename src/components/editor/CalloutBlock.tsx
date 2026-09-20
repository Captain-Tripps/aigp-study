import { Node, mergeAttributes } from '@tiptap/core'

export type CalloutType = 'info' | 'warning' | 'danger' | 'success'

export const CALLOUT_TYPES: CalloutType[] = ['info', 'warning', 'danger', 'success']

const CALLOUT_STYLES: Record<
  CalloutType,
  { border: string; bg: string; text: string; label: string }
> = {
  info: { border: 'border-clay-primary/60', bg: 'bg-clay-primary/5', text: 'text-clay-primary', label: 'Info' },
  warning: { border: 'border-clay-warning/60', bg: 'bg-clay-warningLight/40', text: 'text-clay-warning', label: 'Warning' },
  danger: { border: 'border-clay-danger/60', bg: 'bg-clay-dangerLight/40', text: 'text-clay-danger', label: 'Danger' },
  success: { border: 'border-clay-success/60', bg: 'bg-clay-successLight/40', text: 'text-clay-success', label: 'Success' },
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    calloutBlock: {
      setCallout: (type?: CalloutType) => ReturnType
      updateCalloutType: (type: CalloutType) => ReturnType
    }
  }
}

export const CalloutBlock = Node.create({
  name: 'calloutBlock',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      type: {
        default: 'info' as CalloutType,
        parseHTML: (el) => (el.getAttribute('data-callout-type') as CalloutType) ?? 'info',
        renderHTML: (attrs) => (attrs.type ? { 'data-callout-type': attrs.type } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = (node.attrs.type ?? 'info') as CalloutType
    const style = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-callout': '',
        class: `callout ${style.border} ${style.bg} border-l-4 rounded-clay-sm my-3 overflow-hidden`,
      }),
      ['div', { class: `px-4 pt-2 text-xs font-semibold uppercase tracking-wide ${style.text}` }, style.label],
      ['div', { class: 'px-4 pb-2 pt-1' }],
    ]
  },

  addCommands() {
    return {
      setCallout: (type: CalloutType = 'info') => ({ commands }) =>
        commands.wrapIn(this.name, { type }),
      updateCalloutType: (type: CalloutType) => ({ editor }) => {
        const { $from } = editor.state.selection
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === this.name) {
            const pos = $from.before(depth)
            const tr = editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, type })
            editor.view.dispatch(tr)
            return true
          }
        }
        return false
      },
    }
  },
})

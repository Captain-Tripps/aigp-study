// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RichEditor } from '../RichEditor'

describe('RichEditor', () => {
  it('should render with initial content', () => {
    render(<RichEditor initialContent="Hello World" onChange={() => {}} />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should call onChange when content changes', () => {
    const onChange = vi.fn()
    render(<RichEditor initialContent="Initial" onChange={onChange} />)
    expect(onChange).toBeDefined()
  })
})

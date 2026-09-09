import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatMessage } from './ChatMessage'

describe('ChatMessage markdown', () => {
  it('renders bold markdown', () => {
    render(
      <ChatMessage
        message={{
          id: '1',
          role: 'assistant',
          text: 'There is **water** nearby.',
        }}
      />,
    )
    const strong = screen.getByText('water')
    expect(strong.tagName).toBe('STRONG')
    expect(screen.queryByText('**water**')).toBeNull()
  })
})

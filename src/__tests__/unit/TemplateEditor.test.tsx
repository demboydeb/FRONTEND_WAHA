import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TemplateEditor } from '@/components/antiban/TemplateEditor'
import type { MessageTemplate } from '@/types'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import apiClient from '@/services/api'

const mockTemplates: MessageTemplate[] = [
  {
    id: 'tpl-1',
    sessionId: 'sess-1',
    name: 'Welcome',
    content: 'Hello {{name}}, welcome!',
    variables: ['name'],
    isActive: true,
    usageCount: 5,
  },
  {
    id: 'tpl-2',
    sessionId: 'sess-1',
    name: 'Reminder',
    content: 'Hi {{name}}, reminder about {{event}}.',
    variables: ['name', 'event'],
    isActive: true,
    usageCount: 2,
  },
]

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('TemplateEditor', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { templates: mockTemplates },
    })
  })

  it('renders template list', async () => {
    render(<TemplateEditor sessionId="sess-1" />, { wrapper: makeWrapper() })
    expect(screen.getByTestId('template-list')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Welcome')).toBeInTheDocument()
      expect(screen.getByText('Reminder')).toBeInTheDocument()
    })
  })

  it('renders editor area', async () => {
    render(<TemplateEditor sessionId="sess-1" />, { wrapper: makeWrapper() })
    expect(screen.getByTestId('template-editor')).toBeInTheDocument()
  })

  it('preview updates when content changes', async () => {
    render(<TemplateEditor sessionId="sess-1" />, { wrapper: makeWrapper() })

    // Open new form
    fireEvent.click(screen.getByText('+ New'))

    // Type content with a variable
    const textarea = screen.getByPlaceholderText(/Hello \{\{name\}\}/i)
    fireEvent.change(textarea, { target: { value: 'Hi {{user}}, check your {{order}}!' } })

    await waitFor(() => {
      const preview = screen.getByTestId('template-preview')
      expect(preview).toHaveTextContent('Hi [user], check your [order]!')
    })
  })

  it('shows variables found in content', async () => {
    render(<TemplateEditor sessionId="sess-1" />, { wrapper: makeWrapper() })

    fireEvent.click(screen.getByText('+ New'))

    const textarea = screen.getByPlaceholderText(/Hello \{\{name\}\}/i)
    fireEvent.change(textarea, { target: { value: 'Hello {{firstName}} and {{lastName}}' } })

    await waitFor(() => {
      expect(screen.getByText('{{firstName}}')).toBeInTheDocument()
      expect(screen.getByText('{{lastName}}')).toBeInTheDocument()
    })
  })
})

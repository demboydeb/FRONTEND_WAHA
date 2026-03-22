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
    name: 'OrderConfirm',
    content: 'Your order {{id}} is confirmed.',
    variables: ['id'],
    isActive: true,
    usageCount: 3,
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

describe('TemplateCRUD (integration)', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { templates: mockTemplates } })
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        id: 'tpl-new',
        sessionId: 'sess-1',
        name: 'New Template',
        content: 'Hello!',
        variables: [],
        isActive: true,
        usageCount: 0,
      } satisfies MessageTemplate,
    })
  })

  it('renders template list', async () => {
    render(<TemplateEditor sessionId="sess-1" />, { wrapper: makeWrapper() })
    expect(screen.getByTestId('template-list')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('OrderConfirm')).toBeInTheDocument()
    })
  })

  it('clicking create opens empty form', async () => {
    render(<TemplateEditor sessionId="sess-1" />, { wrapper: makeWrapper() })

    fireEvent.click(screen.getByText('+ New'))

    // Name input and textarea should appear empty
    const nameInput = screen.getByPlaceholderText('Template name')
    expect(nameInput).toBeInTheDocument()
    expect(nameInput).toHaveValue('')
  })

  it('save calls create API when new template', async () => {
    render(<TemplateEditor sessionId="sess-1" />, { wrapper: makeWrapper() })

    fireEvent.click(screen.getByText('+ New'))

    const nameInput = screen.getByPlaceholderText('Template name')
    fireEvent.change(nameInput, { target: { value: 'New Template' } })

    const textarea = screen.getByPlaceholderText(/Hello \{\{name\}\}/i)
    fireEvent.change(textarea, { target: { value: 'Hello!' } })

    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/sessions/sess-1/templates',
        expect.objectContaining({ name: 'New Template', content: 'Hello!' })
      )
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BulkChecker } from '@/components/contacts/BulkChecker'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

import apiClient from '@/services/api'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('BulkChecker (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        total: 2,
        found: 1,
        results: [
          { phone: '+33612345678', jid: '33612345678@s.whatsapp.net', exists: true },
          { phone: '+33600000000', jid: '', exists: false },
        ],
      },
    })
  })

  it('textarea accepts input', async () => {
    const user = userEvent.setup()
    render(<BulkChecker sessionId="sess-1" />, { wrapper: makeWrapper() })
    const textarea = screen.getByTestId('bulk-input')
    await user.type(textarea, '+33612345678')
    expect(textarea).toHaveValue('+33612345678')
  })

  it('submit calls bulk check API', async () => {
    const user = userEvent.setup()
    render(<BulkChecker sessionId="sess-1" />, { wrapper: makeWrapper() })

    const textarea = screen.getByTestId('bulk-input')
    await user.type(textarea, '+33612345678\n+33600000000')

    await user.click(screen.getByTestId('bulk-submit'))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/sessions/sess-1/contacts/check-bulk',
        { phones: ['+33612345678', '+33600000000'] }
      )
    })
  })

  it('shows results after API response', async () => {
    const user = userEvent.setup()
    render(<BulkChecker sessionId="sess-1" />, { wrapper: makeWrapper() })

    const textarea = screen.getByTestId('bulk-input')
    await user.type(textarea, '+33612345678\n+33600000000')
    await user.click(screen.getByTestId('bulk-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('bulk-results')).toBeInTheDocument()
    })

    expect(screen.getByText('+33612345678')).toBeInTheDocument()
    expect(screen.getByText('+33600000000')).toBeInTheDocument()
  })

  it('shows summary text', async () => {
    const user = userEvent.setup()
    render(<BulkChecker sessionId="sess-1" />, { wrapper: makeWrapper() })

    const textarea = screen.getByTestId('bulk-input')
    await user.type(textarea, '+33612345678\n+33600000000')
    await user.click(screen.getByTestId('bulk-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('bulk-summary')).toBeInTheDocument()
    })

    expect(screen.getByTestId('bulk-summary')).toHaveTextContent('1 of 2 found on WhatsApp')
  })
})

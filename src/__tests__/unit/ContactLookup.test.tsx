import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContactLookup } from '@/components/contacts/ContactLookup'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
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

describe('ContactLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input and check button', () => {
    render(<ContactLookup sessionId="sess-1" />, { wrapper: makeWrapper() })
    expect(screen.getByTestId('contact-lookup')).toBeInTheDocument()
    expect(screen.getByTestId('lookup-input')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument()
  })

  it('shows exists result after API call', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url.includes('/exists')) {
        return Promise.resolve({ data: { phone: '+33612345678', jid: '33612345678@s.whatsapp.net', exists: true } })
      }
      if (url.includes('/picture')) {
        return Promise.resolve({ data: { phone: '+33612345678', jid: '33612345678@s.whatsapp.net', pictureUrl: 'http://example.com/pic.jpg', quality: 'low' } })
      }
      if (url.includes('/status')) {
        return Promise.resolve({ data: { phone: '+33612345678', jid: '33612345678@s.whatsapp.net', status: 'Hey there!', setAt: '2024-01-01' } })
      }
      return Promise.resolve({ data: {} })
    })

    render(<ContactLookup sessionId="sess-1" />, { wrapper: makeWrapper() })

    const input = screen.getByTestId('lookup-input')
    await user.type(input, '+33612345678')
    await user.click(screen.getByRole('button', { name: /check/i }))

    await waitFor(() => {
      expect(screen.getByTestId('lookup-result')).toBeInTheDocument()
    })

    expect(screen.getByTestId('lookup-exists')).toBeInTheDocument()
    expect(screen.getByText('Exists on WhatsApp')).toBeInTheDocument()
  })

  it('shows not-found result', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { phone: '+33600000000', jid: '', exists: false },
    })

    render(<ContactLookup sessionId="sess-1" />, { wrapper: makeWrapper() })

    const input = screen.getByTestId('lookup-input')
    await user.type(input, '+33600000000')
    await user.click(screen.getByRole('button', { name: /check/i }))

    await waitFor(() => {
      expect(screen.getByTestId('lookup-result')).toBeInTheDocument()
    })

    expect(screen.getByTestId('lookup-not-found')).toBeInTheDocument()
    expect(screen.getByText('Not on WhatsApp')).toBeInTheDocument()
  })
})

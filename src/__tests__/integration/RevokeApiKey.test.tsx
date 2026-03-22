import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiKeyCard } from '@/components/apikeys/ApiKeyCard'
import type { ApiKey } from '@/types'

const mockApiKey: ApiKey = {
  id: 'key-1',
  sessionId: 'session-1',
  name: 'My Key',
  keyPrefix: 'waha_my_',
  status: 'ACTIVE',
  canSendMessages: true,
  canReadMessages: true,
  usageCount: 10,
  createdAt: '2024-01-01T00:00:00Z',
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('RevokeApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clicking revoke opens confirm modal', async () => {
    const user = userEvent.setup()
    render(
      <ApiKeyCard apiKey={mockApiKey} onRevoke={vi.fn()} />,
      { wrapper: createWrapper() }
    )

    await user.click(screen.getByTestId('revoke-btn'))

    await waitFor(() => {
      expect(screen.getByText('Revoke API Key')).toBeInTheDocument()
    })
  })

  it('confirming calls onRevoke with key id', async () => {
    const onRevoke = vi.fn()
    const user = userEvent.setup()
    render(
      <ApiKeyCard apiKey={mockApiKey} onRevoke={onRevoke} />,
      { wrapper: createWrapper() }
    )

    await user.click(screen.getByTestId('revoke-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-btn')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('confirm-btn'))
    expect(onRevoke).toHaveBeenCalledWith('key-1')
  })

  it('cancelling does not call onRevoke', async () => {
    const onRevoke = vi.fn()
    const user = userEvent.setup()
    render(
      <ApiKeyCard apiKey={mockApiKey} onRevoke={onRevoke} />,
      { wrapper: createWrapper() }
    )

    await user.click(screen.getByTestId('revoke-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('cancel-btn')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('cancel-btn'))
    expect(onRevoke).not.toHaveBeenCalled()
  })
})

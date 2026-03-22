import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateApiKeyModal } from '@/components/apikeys/CreateApiKeyModal'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

import apiClient from '@/services/api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockApiClient = apiClient as unknown as {
  post: ReturnType<typeof vi.fn>
  get: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const defaultProps = {
  open: true,
  sessionId: 'session-1',
  onClose: vi.fn(),
}

describe('CreateApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders name input', () => {
    render(<CreateApiKeyModal {...defaultProps} />, { wrapper: createWrapper() })
    expect(screen.getByTestId('apikey-name-input')).toBeInTheDocument()
  })

  it('submit calls POST API', async () => {
    mockApiClient.post.mockResolvedValue({
      data: {
        message: 'Created',
        rawKey: 'waha_test_raw_key_123456',
        apiKey: { id: 'k1', name: 'Test Key', keyPrefix: 'waha_test_' },
      },
    })

    const user = userEvent.setup()
    render(<CreateApiKeyModal {...defaultProps} />, { wrapper: createWrapper() })

    await user.type(screen.getByTestId('apikey-name-input'), 'Test Key')
    await user.click(screen.getByRole('button', { name: /create key/i }))

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/sessions/session-1/keys',
        { name: 'Test Key' }
      )
    })
  })

  it('after success shows raw key display', async () => {
    mockApiClient.post.mockResolvedValue({
      data: {
        message: 'Created',
        rawKey: 'waha_test_raw_key_123456',
        apiKey: { id: 'k1', name: 'Test Key', keyPrefix: 'waha_test_' },
      },
    })

    const user = userEvent.setup()
    render(<CreateApiKeyModal {...defaultProps} />, { wrapper: createWrapper() })

    await user.type(screen.getByTestId('apikey-name-input'), 'Test Key')
    await user.click(screen.getByRole('button', { name: /create key/i }))

    await waitFor(() => {
      expect(screen.getByTestId('raw-key-display')).toBeInTheDocument()
    })

    const rawKeyInput = screen.getByTestId('raw-key-display') as HTMLInputElement
    expect(rawKeyInput.value).toBe('waha_test_raw_key_123456')
  })

  it('raw key has copy button', async () => {
    mockApiClient.post.mockResolvedValue({
      data: {
        message: 'Created',
        rawKey: 'waha_test_raw_key_123456',
        apiKey: { id: 'k1', name: 'Test Key', keyPrefix: 'waha_test_' },
      },
    })

    const user = userEvent.setup()
    render(<CreateApiKeyModal {...defaultProps} />, { wrapper: createWrapper() })

    await user.type(screen.getByTestId('apikey-name-input'), 'Test Key')
    await user.click(screen.getByRole('button', { name: /create key/i }))

    await waitFor(() => {
      expect(screen.getByTestId('raw-key-display')).toBeInTheDocument()
    })

    expect(screen.getByTestId('copy-raw-key-btn')).toBeInTheDocument()
  })
})

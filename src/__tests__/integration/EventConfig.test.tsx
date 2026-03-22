import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EventConfigPanel } from '@/components/events/EventConfigPanel'
import type { EventConfig } from '@/types'

// Mock apiClient
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock auth store (needed by apiClient interceptor)
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ accessToken: 'test-token' })),
  },
}))

const mockEvents: EventConfig[] = [
  {
    id: '1',
    sessionId: 'session-1',
    eventType: 'MESSAGE_RECEIVED',
    enabled: true,
    forwardToWebhook: false,
    forwardToSocket: true,
    filterOwn: false,
  },
  {
    id: '2',
    sessionId: 'session-1',
    eventType: 'MESSAGE_SENT',
    enabled: false,
    forwardToWebhook: false,
    forwardToSocket: false,
    filterOwn: false,
  },
  {
    id: '3',
    sessionId: 'session-1',
    eventType: 'CONNECTION_UPDATE',
    enabled: true,
    forwardToWebhook: true,
    forwardToSocket: false,
    filterOwn: false,
  },
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('EventConfigPanel integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { default: apiClient } = await import('@/services/api')
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockEvents })
    vi.mocked(apiClient.put).mockResolvedValue({ data: {} })
  })

  it('shows loading spinner while fetching', async () => {
    const { default: apiClient } = await import('@/services/api')

    // Delay the response so spinner is visible
    vi.mocked(apiClient.get).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: mockEvents }), 100))
    )

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <EventConfigPanel sessionId="session-1" />
      </Wrapper>
    )

    // The spinner role is "status"
    expect(screen.getByRole('status')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('renders event toggles after load', async () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <EventConfigPanel sessionId="session-1" />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('event-toggle-MESSAGE_RECEIVED')).toBeInTheDocument()
    })

    expect(screen.getByTestId('event-toggle-MESSAGE_SENT')).toBeInTheDocument()
    expect(screen.getByTestId('event-toggle-CONNECTION_UPDATE')).toBeInTheDocument()
  })

  it('calls API on toggle change', async () => {
    const user = userEvent.setup()
    const { default: apiClient } = await import('@/services/api')

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <EventConfigPanel sessionId="session-1" />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('event-toggle-MESSAGE_SENT')).toBeInTheDocument()
    })

    // Find the enabled checkbox for MESSAGE_SENT (currently unchecked)
    const enabledCheckbox = screen.getByLabelText('MESSAGE_SENT enabled')
    await user.click(enabledCheckbox)

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        '/sessions/session-1/events',
        expect.objectContaining({ eventType: 'MESSAGE_SENT', enabled: true })
      )
    })
  })
})

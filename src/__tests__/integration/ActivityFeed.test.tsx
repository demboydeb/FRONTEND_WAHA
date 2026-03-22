import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ActivityFeed } from '@/components/events/ActivityFeed'

// socketService mock
const mockSocketHandlers: Record<string, ((...args: unknown[]) => void)[]> = {}

vi.mock('@/services/socket', () => ({
  default: {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!mockSocketHandlers[event]) {
        mockSocketHandlers[event] = []
      }
      mockSocketHandlers[event].push(handler)
    }),
    off: vi.fn((event: string, handler?: (...args: unknown[]) => void) => {
      if (handler && mockSocketHandlers[event]) {
        mockSocketHandlers[event] = mockSocketHandlers[event].filter((h) => h !== handler)
      } else {
        delete mockSocketHandlers[event]
      }
    }),
    emit: vi.fn(),
    isConnected: vi.fn(() => false),
  },
  socketService: {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!mockSocketHandlers[event]) {
        mockSocketHandlers[event] = []
      }
      mockSocketHandlers[event].push(handler)
    }),
    off: vi.fn((event: string, handler?: (...args: unknown[]) => void) => {
      if (handler && mockSocketHandlers[event]) {
        mockSocketHandlers[event] = mockSocketHandlers[event].filter((h) => h !== handler)
      } else {
        delete mockSocketHandlers[event]
      }
    }),
    emit: vi.fn(),
    isConnected: vi.fn(() => false),
  },
}))

const emitSocketEvent = (event: string, data: unknown) => {
  const handlers = mockSocketHandlers[event] ?? []
  handlers.forEach((h) => h(data))
}

describe('ActivityFeed', () => {
  beforeEach(() => {
    // Clear handlers between tests
    Object.keys(mockSocketHandlers).forEach((key) => {
      delete mockSocketHandlers[key]
    })
    vi.clearAllMocks()
  })

  it('renders empty state when no events', () => {
    render(<ActivityFeed sessionId="session-1" />)
    expect(screen.getByText('No events yet...')).toBeInTheDocument()
  })

  it('shows data-testid="activity-feed" on root', () => {
    render(<ActivityFeed sessionId="session-1" />)
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
  })

  it('adds events when socket emits', async () => {
    render(<ActivityFeed sessionId="session-1" />)

    expect(screen.getByText('No events yet...')).toBeInTheDocument()

    await act(async () => {
      emitSocketEvent('MESSAGE_RECEIVED', {
        sessionId: 'session-1',
        from: '1234567890@s.whatsapp.net',
        body: 'Hello',
      })
    })

    expect(screen.queryByText('No events yet...')).not.toBeInTheDocument()
    expect(screen.getByTestId('activity-event')).toBeInTheDocument()
  })

  it('shows multiple events as multiple activity-event rows', async () => {
    render(<ActivityFeed sessionId="session-1" />)

    await act(async () => {
      emitSocketEvent('MESSAGE_RECEIVED', { sessionId: 'session-1', body: 'msg1' })
      emitSocketEvent('MESSAGE_SENT', { sessionId: 'session-1', body: 'msg2' })
    })

    const eventRows = screen.getAllByTestId('activity-event')
    expect(eventRows.length).toBeGreaterThanOrEqual(2)
  })

  it('does not add events from different sessions', async () => {
    render(<ActivityFeed sessionId="session-1" />)

    await act(async () => {
      emitSocketEvent('MESSAGE_RECEIVED', {
        sessionId: 'session-99',
        body: 'from other session',
      })
    })

    expect(screen.getByText('No events yet...')).toBeInTheDocument()
  })

  it('adds session events without sessionId filter', async () => {
    render(<ActivityFeed sessionId="session-1" />)

    await act(async () => {
      emitSocketEvent('session:connected', { status: 'CONNECTED' })
    })

    expect(screen.queryByText('No events yet...')).not.toBeInTheDocument()
    expect(screen.getByTestId('activity-event')).toBeInTheDocument()
  })
})

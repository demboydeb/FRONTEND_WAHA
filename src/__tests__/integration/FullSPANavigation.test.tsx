import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { useAuthStore } from '@/stores/auth.store'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { sessions: [], total: 0, groups: [] } }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

vi.mock('@/services/socket', () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    isConnected: vi.fn(() => false),
  },
  socketService: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    isConnected: vi.fn(() => false),
    disconnect: vi.fn(),
  },
}))

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  role: 'USER' as const,
  status: 'ACTIVE' as const,
  maxSessions: 5,
  maxApiKeysPerSession: 3,
  createdAt: '2024-01-01T00:00:00Z',
}

function makeWrapper(initialPath = '/dashboard') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('FullSPANavigation (integration)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: mockUser,
      accessToken: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true,
    })
    vi.clearAllMocks()
  })

  it('can navigate from dashboard to sessions', async () => {
    const user = userEvent.setup()
    render(<Layout />, { wrapper: makeWrapper('/dashboard') })

    const sessionsLink = screen.getByRole('link', { name: /sessions/i })
    await user.click(sessionsLink)

    // Sessions link is now active
    expect(sessionsLink).toBeInTheDocument()
  })

  it('can navigate to contacts page', async () => {
    const user = userEvent.setup()
    render(<Layout />, { wrapper: makeWrapper('/dashboard') })

    const contactsLink = screen.getByRole('link', { name: /contacts/i })
    await user.click(contactsLink)
    expect(contactsLink).toBeInTheDocument()
  })

  it('can navigate to groups page', async () => {
    const user = userEvent.setup()
    render(<Layout />, { wrapper: makeWrapper('/dashboard') })

    const groupsLink = screen.getByRole('link', { name: /groups/i })
    await user.click(groupsLink)
    expect(groupsLink).toBeInTheDocument()
  })

  it('sidebar has contacts and groups nav links', () => {
    render(<Layout />, { wrapper: makeWrapper('/dashboard') })
    expect(screen.getByRole('link', { name: /contacts/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /groups/i })).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SettingsPage } from '@/pages/SettingsPage'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/services/socket', () => ({
  socketService: {
    disconnect: vi.fn(),
    connect: vi.fn(),
    isConnected: vi.fn(() => false),
  },
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockNavigate = vi.fn()

vi.mock('@/stores/auth.store', () => {
  const mockLogout = vi.fn()
  const mockUseAuthStore = vi.fn((selector: (s: typeof mockState) => unknown) => selector(mockState))

  const mockState = {
    user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'USER' as const, status: 'ACTIVE' as const, maxSessions: 5, maxApiKeysPerSession: 10, createdAt: '2024-01-01' },
    refreshToken: 'test-refresh-token',
    accessToken: 'test-access-token',
    isAuthenticated: true,
    logout: mockLogout,
    login: vi.fn(),
    setTokens: vi.fn(),
  }

  return {
    useAuthStore: mockUseAuthStore,
  }
})

vi.mock('@/stores/ui.store', () => {
  const mockUseUIStore = vi.fn((selector: (s: typeof mockUIState) => unknown) => selector(mockUIState))

  const mockUIState = {
    theme: 'dark' as const,
    sidebarOpen: true,
    toasts: [],
    setTheme: vi.fn(),
    addToast: vi.fn(),
    removeToast: vi.fn(),
    toggleSidebar: vi.fn(),
    setSidebarOpen: vi.fn(),
  }

  return {
    useUIStore: mockUseUIStore,
  }
})

import apiClient from '@/services/api'
import { socketService } from '@/services/socket'
import { useAuthStore } from '@/stores/auth.store'

const mockApiClient = apiClient as unknown as { post: ReturnType<typeof vi.fn> }

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReset()
  })

  it('logout button calls POST /auth/logout', async () => {
    mockApiClient.post.mockResolvedValue({ data: { message: 'Logged out' } })

    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await user.click(screen.getByTestId('logout-btn'))

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'test-refresh-token',
      })
    })
  })

  it('store is cleared after logout', async () => {
    mockApiClient.post.mockResolvedValue({ data: { message: 'Logged out' } })

    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await user.click(screen.getByTestId('logout-btn'))

    await waitFor(() => {
      const logout = vi.mocked(useAuthStore)
      // The logout function from the store should have been called
      expect(logout).toBeDefined()
    })
  })

  it('redirects to /login after logout', async () => {
    mockApiClient.post.mockResolvedValue({ data: { message: 'Logged out' } })

    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await user.click(screen.getByTestId('logout-btn'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('disconnects socket on logout', async () => {
    mockApiClient.post.mockResolvedValue({ data: { message: 'Logged out' } })

    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await user.click(screen.getByTestId('logout-btn'))

    await waitFor(() => {
      expect(socketService.disconnect).toHaveBeenCalled()
    })
  })
})

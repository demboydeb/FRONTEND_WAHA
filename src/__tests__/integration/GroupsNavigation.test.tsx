import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GroupsPage } from '@/pages/GroupsPage'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/stores/ui.store', () => ({
  useUIStore: vi.fn((selector: (s: { addToast: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ addToast: vi.fn() })
  ),
}))

import apiClient from '@/services/api'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('GroupsNavigation (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { sessions: [], total: 0 },
    })
  })

  it('renders groups page', () => {
    render(<GroupsPage />, { wrapper: makeWrapper() })
    expect(screen.getByTestId('groups-page')).toBeInTheDocument()
  })

  it('shows session selector', () => {
    render(<GroupsPage />, { wrapper: makeWrapper() })
    // The select element has an option "Select a session..."
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows group list prompt when no session selected', () => {
    render(<GroupsPage />, { wrapper: makeWrapper() })
    expect(screen.getByText(/select a session to manage groups/i)).toBeInTheDocument()
  })

  it('has Groups heading', () => {
    render(<GroupsPage />, { wrapper: makeWrapper() })
    expect(screen.getByRole('heading', { name: /groups/i })).toBeInTheDocument()
  })
})

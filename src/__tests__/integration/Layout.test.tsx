import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { useAuthStore } from '@/stores/auth.store'

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

describe('Layout', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: mockUser,
      accessToken: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true,
    })
  })

  it('renders sidebar navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Layout />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sessions/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /api keys/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders header with toggle button', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Layout />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument()
  })

  it('toggles sidebar when button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Layout />
      </MemoryRouter>
    )
    const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i })
    await user.click(toggleBtn)
    // After toggle, sidebar should be collapsed (nav text hidden)
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })
})

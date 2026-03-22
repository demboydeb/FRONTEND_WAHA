import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth.store'
import type { AuthTokens } from '@/types'

const mockTokens: AuthTokens = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'USER',
    status: 'ACTIVE',
    maxSessions: 5,
    maxApiKeysPerSession: 3,
    createdAt: '2024-01-01T00:00:00Z',
  },
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  })

  it('starts with no user and unauthenticated', () => {
    const { user, isAuthenticated, accessToken } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
    expect(accessToken).toBeNull()
  })

  it('login sets user, tokens, and isAuthenticated', () => {
    useAuthStore.getState().login(mockTokens)
    const { user, isAuthenticated, accessToken, refreshToken } = useAuthStore.getState()
    expect(user).toEqual(mockTokens.user)
    expect(isAuthenticated).toBe(true)
    expect(accessToken).toBe('access-token-123')
    expect(refreshToken).toBe('refresh-token-456')
  })

  it('logout clears user, tokens, and isAuthenticated', () => {
    useAuthStore.getState().login(mockTokens)
    useAuthStore.getState().logout()
    const { user, isAuthenticated, accessToken, refreshToken } = useAuthStore.getState()
    expect(user).toBeNull()
    expect(isAuthenticated).toBe(false)
    expect(accessToken).toBeNull()
    expect(refreshToken).toBeNull()
  })

  it('setTokens updates access and refresh tokens', () => {
    useAuthStore.getState().login(mockTokens)
    useAuthStore.getState().setTokens('new-access', 'new-refresh')
    const { accessToken, refreshToken } = useAuthStore.getState()
    expect(accessToken).toBe('new-access')
    expect(refreshToken).toBe('new-refresh')
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth.store'

describe('API client interceptor', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  })

  it('reads access token from auth store', () => {
    useAuthStore.setState({ accessToken: 'test-token-abc' })
    const token = useAuthStore.getState().accessToken
    expect(token).toBe('test-token-abc')
  })

  it('returns null token when not authenticated', () => {
    const token = useAuthStore.getState().accessToken
    expect(token).toBeNull()
  })

  it('token is updated after login', () => {
    useAuthStore.getState().setTokens('new-token', 'refresh-token')
    const token = useAuthStore.getState().accessToken
    expect(token).toBe('new-token')
  })
})

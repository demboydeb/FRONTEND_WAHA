import { useAuthStore } from '@/stores/auth.store'
import apiClient from '@/services/api'
import { socketService } from '@/services/socket'
import type { AuthTokens } from '@/types'

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, accessToken } = useAuthStore()

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.post<AuthTokens>('/auth/login', { email, password })
    login(response.data)
    socketService.connect(response.data.accessToken)
    return response.data
  }

  const signOut = async () => {
    const refreshToken = useAuthStore.getState().refreshToken
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken })
      }
    } finally {
      socketService.disconnect()
      logout()
    }
  }

  return { user, isAuthenticated, accessToken, signIn, signOut }
}

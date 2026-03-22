import { useEffect } from 'react'
import { socketService } from '@/services/socket'
import { useAuthStore } from '@/stores/auth.store'

export const useSocket = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated && accessToken && !socketService.isConnected()) {
      socketService.connect(accessToken)
    }
    return () => {
      // Don't disconnect on unmount — socket should persist across page navigation
    }
  }, [isAuthenticated, accessToken])

  return socketService
}

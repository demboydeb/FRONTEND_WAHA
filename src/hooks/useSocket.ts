import { useEffect, useCallback } from 'react'
import { socketService } from '@/services/socket'
import { useAuthStore } from '@/stores/auth.store'
import { useSessionStore } from '@/stores/session.store'
import type { SessionStatus } from '@/types'

interface SessionStatusEvent {
  sessionId: string
  status: SessionStatus
}

interface SessionConnectedEvent {
  sessionId: string
  phoneNumber: string
}

export const useSocket = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const updateSessionStatus = useSessionStore((s) => s.updateSessionStatus)
  const updateSession = useSessionStore((s) => s.updateSession)

  const handleStatusUpdate = useCallback(
    (data: SessionStatusEvent) => {
      updateSessionStatus(data.sessionId, data.status)
    },
    [updateSessionStatus]
  )

  const handleConnected = useCallback(
    (data: SessionConnectedEvent) => {
      updateSession(data.sessionId, {
        status: 'CONNECTED',
        phoneNumber: data.phoneNumber,
      })
    },
    [updateSession]
  )

  const handleDisconnected = useCallback(
    (data: { sessionId: string }) => {
      updateSessionStatus(data.sessionId, 'DISCONNECTED')
    },
    [updateSessionStatus]
  )

  const handleConnectionUpdate = useCallback(
    (data: { sessionId: string; status: SessionStatus }) => {
      updateSessionStatus(data.sessionId, data.status)
    },
    [updateSessionStatus]
  )

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    if (!socketService.isConnected()) {
      socketService.connect(accessToken)
    }

    socketService.on('session:status', handleStatusUpdate)
    socketService.on('session:connected', handleConnected)
    socketService.on('session:disconnected', handleDisconnected)
    socketService.on('CONNECTION_UPDATE', handleConnectionUpdate)

    return () => {
      socketService.off('session:status', handleStatusUpdate)
      socketService.off('session:connected', handleConnected)
      socketService.off('session:disconnected', handleDisconnected)
      socketService.off('CONNECTION_UPDATE', handleConnectionUpdate)
    }
  }, [isAuthenticated, accessToken, handleStatusUpdate, handleConnected, handleDisconnected, handleConnectionUpdate])

  return socketService
}

export const useSessionSocket = (sessionId: string) => {
  const socket = useSocket()

  useEffect(() => {
    if (sessionId) {
      socket.joinSession(sessionId)
    }
  }, [sessionId, socket])

  return socket
}

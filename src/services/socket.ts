import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private joinedSessions = new Set<string>()

  connect(token: string): void {
    if (this.socket?.connected) return

    this.socket = io('/dashboard', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to /dashboard')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.joinedSessions.clear()
    }
  }

  joinSession(sessionId: string): void {
    if (this.joinedSessions.has(sessionId)) return
    this.socket?.emit('session:join', sessionId)
    this.joinedSessions.add(sessionId)
  }

  leaveSession(sessionId: string): void {
    this.joinedSessions.delete(sessionId)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback)
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()
export default socketService

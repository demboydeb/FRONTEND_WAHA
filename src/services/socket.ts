import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

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
    }
  }

  joinSession(sessionId: string): void {
    this.socket?.emit('session:join', sessionId)
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    this.socket?.off(event, callback)
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()
export default socketService

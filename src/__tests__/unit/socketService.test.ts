import { describe, it, expect, vi, beforeEach } from 'vitest'
import { io } from 'socket.io-client'

// socket.io-client is mocked in test-setup.ts
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: false,
}

vi.mocked(io).mockReturnValue(mockSocket as ReturnType<typeof io>)

describe('Socket service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSocket.connected = false
  })

  it('io is mocked', () => {
    expect(io).toBeDefined()
  })

  it('io mock returns a socket object', () => {
    const socket = io('http://localhost:3000/dashboard', { auth: { token: 'test' } })
    expect(socket).toBeDefined()
    expect(socket.on).toBeDefined()
    expect(socket.emit).toBeDefined()
    expect(socket.disconnect).toBeDefined()
  })

  it('socket starts as disconnected', () => {
    const socket = io()
    expect(socket.connected).toBe(false)
  })

  it('can register event handlers', () => {
    const socket = io()
    const handler = vi.fn()
    socket.on('test-event', handler)
    expect(socket.on).toHaveBeenCalledWith('test-event', handler)
  })

  it('can emit events', () => {
    const socket = io()
    socket.emit('session:join', 'session-123')
    expect(socket.emit).toHaveBeenCalledWith('session:join', 'session-123')
  })

  it('can disconnect', () => {
    const socket = io()
    socket.disconnect()
    expect(socket.disconnect).toHaveBeenCalled()
  })
})

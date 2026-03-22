import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { io } from 'socket.io-client'
import { QRCodeViewer } from '@/components/qr/QRCodeViewer'

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
}

vi.mocked(io).mockReturnValue(mockSocket as unknown as ReturnType<typeof io>)

describe('QR Code Socket integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates QR display when new qrData is received', async () => {
    const { rerender } = render(
      <QRCodeViewer qrData={null} sessionId="s1" />
    )
    expect(screen.getByRole('status')).toBeInTheDocument()

    await act(async () => {
      rerender(<QRCodeViewer qrData="new-qr-data-from-socket" sessionId="s1" />)
    })

    expect(screen.getByTestId('qr-code-container')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows spinner while waiting for QR', () => {
    render(<QRCodeViewer qrData={null} sessionId="s1" />)
    expect(screen.getByText(/waiting for qr code/i)).toBeInTheDocument()
  })

  it('transitions from loading to QR display on data arrival', async () => {
    const { rerender } = render(<QRCodeViewer qrData={null} sessionId="s1" />)

    expect(screen.queryByTestId('qr-code-container')).not.toBeInTheDocument()

    await act(async () => {
      rerender(
        <QRCodeViewer
          qrData="ws-received-qr-value"
          expiresAt={new Date(Date.now() + 120000).toISOString()}
          sessionId="s1"
        />
      )
    })

    expect(screen.getByTestId('qr-code-container')).toBeInTheDocument()
    expect(screen.getByText(/expires in/i)).toBeInTheDocument()
  })
})

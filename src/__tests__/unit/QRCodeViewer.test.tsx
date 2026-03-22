import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QRCodeViewer } from '@/components/qr/QRCodeViewer'

describe('QRCodeViewer', () => {
  it('shows spinner when qrData is null', () => {
    render(<QRCodeViewer qrData={null} sessionId="s1" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/waiting for qr code/i)).toBeInTheDocument()
  })

  it('renders QR code container when qrData is provided', () => {
    render(<QRCodeViewer qrData="test-qr-data" sessionId="s1" />)
    expect(screen.getByTestId('qr-code-container')).toBeInTheDocument()
  })

  it('shows countdown when expiresAt is in the future', () => {
    const future = new Date(Date.now() + 60000).toISOString()
    render(<QRCodeViewer qrData="test-qr" expiresAt={future} sessionId="s1" />)
    expect(screen.getByText(/expires in/i)).toBeInTheDocument()
  })

  it('calls onExpired when QR code expires', () => {
    const onExpired = vi.fn()
    const past = new Date(Date.now() - 1000).toISOString()
    render(<QRCodeViewer qrData="test-qr" expiresAt={past} sessionId="s1" onExpired={onExpired} />)
    expect(onExpired).toHaveBeenCalled()
  })

  it('shows expired state when expiresAt is in the past', () => {
    const past = new Date(Date.now() - 5000).toISOString()
    render(<QRCodeViewer qrData="test-qr" expiresAt={past} sessionId="s1" />)
    expect(screen.getByText(/expired/i)).toBeInTheDocument()
  })
})

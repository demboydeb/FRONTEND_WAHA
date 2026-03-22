import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiKeyCard } from '@/components/apikeys/ApiKeyCard'
import type { ApiKey } from '@/types'

const mockApiKey: ApiKey = {
  id: 'key-1',
  sessionId: 'session-1',
  name: 'Production Key',
  keyPrefix: 'waha_prod_',
  status: 'ACTIVE',
  canSendMessages: true,
  canReadMessages: false,
  usageCount: 42,
  lastUsedAt: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
}

describe('ApiKeyCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders key name and prefix', () => {
    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={vi.fn()} />)
    expect(screen.getByText('Production Key')).toBeInTheDocument()
    expect(screen.getByText('waha_prod_')).toBeInTheDocument()
  })

  it('shows ACTIVE status badge', () => {
    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={vi.fn()} />)
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('copy button copies to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={vi.fn()} />)

    // Use fireEvent to avoid userEvent replacing the clipboard mock
    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-btn'))
    })

    expect(writeText).toHaveBeenCalledWith(mockApiKey.keyPrefix)
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('clicking revoke shows confirm modal', async () => {
    const user = userEvent.setup()
    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={vi.fn()} />)
    await user.click(screen.getByTestId('revoke-btn'))
    expect(screen.getByText('Revoke API Key')).toBeInTheDocument()
  })

  it('cancel button in confirm modal does not revoke', async () => {
    const onRevoke = vi.fn()
    const user = userEvent.setup()
    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={onRevoke} />)
    await user.click(screen.getByTestId('revoke-btn'))
    expect(screen.getByText('Revoke API Key')).toBeInTheDocument()
    await user.click(screen.getByTestId('cancel-btn'))
    expect(onRevoke).not.toHaveBeenCalled()
  })

  it('confirm button calls onRevoke', async () => {
    const onRevoke = vi.fn()
    const user = userEvent.setup()
    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={onRevoke} />)
    await user.click(screen.getByTestId('revoke-btn'))
    await user.click(screen.getByTestId('confirm-btn'))
    expect(onRevoke).toHaveBeenCalledWith('key-1')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SessionList } from '@/components/sessions/SessionList'
import type { Session } from '@/types'

const mockSessions: Session[] = [
  {
    id: 'session-1',
    userId: 'user-1',
    name: 'Business Account',
    status: 'CONNECTED',
    connectionMethod: 'QR_CODE',
    isActive: true,
    webhookEnabled: false,
    mediaDownloadEnabled: true,
    mediaDownloadTypes: ['image'],
    mediaTtlSeconds: 3600,
    createdAt: '2024-01-01T00:00:00Z',
    phoneNumber: '+33612345678',
  },
  {
    id: 'session-2',
    userId: 'user-1',
    name: 'Personal Account',
    status: 'DISCONNECTED',
    connectionMethod: 'PAIRING_CODE',
    isActive: false,
    webhookEnabled: false,
    mediaDownloadEnabled: false,
    mediaDownloadTypes: [],
    mediaTtlSeconds: 3600,
    createdAt: '2024-01-02T00:00:00Z',
  },
]

const renderSessionList = (sessions: Session[] = mockSessions) => {
  return render(
    <MemoryRouter>
      <SessionList sessions={sessions} />
    </MemoryRouter>
  )
}

describe('SessionList', () => {
  it('renders all sessions', () => {
    renderSessionList()
    expect(screen.getByText('Business Account')).toBeInTheDocument()
    expect(screen.getByText('Personal Account')).toBeInTheDocument()
  })

  it('shows session status badges', () => {
    renderSessionList()
    expect(screen.getByText('CONNECTED')).toBeInTheDocument()
    expect(screen.getByText('DISCONNECTED')).toBeInTheDocument()
  })

  it('shows phone number when present', () => {
    renderSessionList()
    expect(screen.getByText('+33612345678')).toBeInTheDocument()
  })

  it('shows empty state when no sessions', () => {
    renderSessionList([])
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument()
  })

  it('shows spinner when loading', () => {
    render(
      <MemoryRouter>
        <SessionList sessions={[]} loading />
      </MemoryRouter>
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders session list container with correct testid', () => {
    renderSessionList()
    expect(screen.getByTestId('session-list')).toBeInTheDocument()
  })
})

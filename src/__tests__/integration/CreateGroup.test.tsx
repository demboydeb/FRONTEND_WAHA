import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateGroupModal } from '@/components/groups/CreateGroupModal'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('@/stores/ui.store', () => ({
  useUIStore: vi.fn((selector: (s: { addToast: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ addToast: vi.fn() })
  ),
}))

import apiClient from '@/services/api'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const defaultProps = {
  open: true,
  sessionId: 'sess-1',
  onClose: vi.fn(),
  onCreated: vi.fn(),
}

describe('CreateGroup (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        id: 'group-new',
        subject: 'My New Group',
        participantCount: 2,
      },
    })
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { total: 0, groups: [] },
    })
  })

  it('name + participants inputs exist', () => {
    render(<CreateGroupModal {...defaultProps} />, { wrapper: makeWrapper() })
    expect(screen.getByTestId('create-group-modal')).toBeInTheDocument()
    expect(screen.getByLabelText(/group name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/participants/i)).toBeInTheDocument()
  })

  it('submit calls POST groups API', async () => {
    const user = userEvent.setup()
    render(<CreateGroupModal {...defaultProps} />, { wrapper: makeWrapper() })

    await user.type(screen.getByLabelText(/group name/i), 'My New Group')
    await user.type(
      screen.getByLabelText(/participants/i),
      '33612345678@s.whatsapp.net'
    )

    await user.click(screen.getByRole('button', { name: /create group/i }))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/sessions/sess-1/groups',
        {
          name: 'My New Group',
          participants: ['33612345678@s.whatsapp.net'],
        }
      )
    })
  })

  it('shows validation error when name is too short', async () => {
    const user = userEvent.setup()
    render(<CreateGroupModal {...defaultProps} />, { wrapper: makeWrapper() })

    await user.type(screen.getByLabelText(/group name/i), 'A')
    await user.click(screen.getByRole('button', { name: /create group/i }))

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument()
  })

  it('shows validation error when no participants', async () => {
    const user = userEvent.setup()
    render(<CreateGroupModal {...defaultProps} />, { wrapper: makeWrapper() })

    await user.type(screen.getByLabelText(/group name/i), 'My Group')
    await user.click(screen.getByRole('button', { name: /create group/i }))

    expect(await screen.findByText(/at least one participant/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<CreateGroupModal {...defaultProps} open={false} />, { wrapper: makeWrapper() })
    expect(screen.queryByTestId('create-group-modal')).not.toBeInTheDocument()
  })
})

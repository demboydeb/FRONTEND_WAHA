import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateSessionModal } from '@/components/sessions/CreateSessionModal'

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
  loading: false,
}

describe('CreateSession stepper', () => {
  it('stepper shows 3 steps', () => {
    render(<CreateSessionModal {...defaultProps} />)
    // There are 3 step labels: Details, Connection, Confirm
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Connection')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('next button advances steps', async () => {
    const user = userEvent.setup()
    render(<CreateSessionModal {...defaultProps} />)

    // Step 0: Details — fill in required name field
    expect(screen.getByText('Session Name')).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText('My WhatsApp Session')
    await user.type(nameInput, 'Test Session')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Should advance to step 1 (Connection)
    await waitFor(() => {
      expect(screen.getByText('Choose connection method')).toBeInTheDocument()
    })
  })

  it('back button goes back', async () => {
    const user = userEvent.setup()
    render(<CreateSessionModal {...defaultProps} />)

    // Fill in name and advance to step 1
    const nameInput = screen.getByPlaceholderText('My WhatsApp Session')
    await user.type(nameInput, 'Test Session')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Choose connection method')).toBeInTheDocument()
    })

    // Click back
    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)

    // Should be back on step 0 (Details)
    await waitFor(() => {
      expect(screen.getByText('Session Name')).toBeInTheDocument()
    })
  })

  it('confirm step shows summary', async () => {
    const user = userEvent.setup()
    render(<CreateSessionModal {...defaultProps} />)

    // Step 0: fill in name
    const nameInput = screen.getByPlaceholderText('My WhatsApp Session')
    await user.type(nameInput, 'My Test Session')

    let nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Step 1: advance to step 2
    await waitFor(() => {
      expect(screen.getByText('Choose connection method')).toBeInTheDocument()
    })

    nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Step 2: Confirm — should show summary with session name
    await waitFor(() => {
      expect(screen.getByText('Review before creating')).toBeInTheDocument()
    })

    expect(screen.getByText('My Test Session')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create session/i })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<CreateSessionModal {...defaultProps} open={false} />)
    expect(screen.queryByText('New Session')).not.toBeInTheDocument()
  })
})

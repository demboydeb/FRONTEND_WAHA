import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PairingCodeInput } from '@/components/qr/PairingCodeInput'

describe('PairingCodeInput', () => {
  it('renders the phone number input form', () => {
    render(<PairingCodeInput pairingCode={null} onRequestCode={vi.fn()} />)
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request code/i })).toBeInTheDocument()
  })

  it('shows error for invalid phone number', async () => {
    const user = userEvent.setup()
    render(<PairingCodeInput pairingCode={null} onRequestCode={vi.fn()} />)
    await user.type(screen.getByLabelText(/phone number/i), 'abc')
    await user.click(screen.getByRole('button', { name: /request code/i }))
    expect(await screen.findByText(/valid phone number/i)).toBeInTheDocument()
  })

  it('accepts a valid international phone number and calls onRequestCode', async () => {
    const user = userEvent.setup()
    const onRequestCode = vi.fn()
    render(<PairingCodeInput pairingCode={null} onRequestCode={onRequestCode} />)
    await user.type(screen.getByLabelText(/phone number/i), '+33612345678')
    await user.click(screen.getByRole('button', { name: /request code/i }))
    expect(await screen.findByText(/requesting pairing code/i)).toBeInTheDocument()
    expect(onRequestCode).toHaveBeenCalledWith('+33612345678')
  })

  it('accepts phone number without + prefix', async () => {
    const user = userEvent.setup()
    const onRequestCode = vi.fn()
    render(<PairingCodeInput pairingCode={null} onRequestCode={onRequestCode} />)
    await user.type(screen.getByLabelText(/phone number/i), '33612345678')
    await user.click(screen.getByRole('button', { name: /request code/i }))
    expect(onRequestCode).toHaveBeenCalledWith('33612345678')
  })

  it('displays the pairing code when provided', () => {
    render(<PairingCodeInput pairingCode="ABCD1234" onRequestCode={vi.fn()} />)
    expect(screen.getByTestId('pairing-code-display')).toHaveTextContent('ABCD1234')
  })

  it('shows loading state when loading prop is true', () => {
    render(<PairingCodeInput pairingCode={null} loading onRequestCode={vi.fn()} />)
    expect(screen.getByRole('button', { name: /request code/i })).toBeDisabled()
  })
})

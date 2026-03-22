import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventToggle } from '@/components/events/EventToggle'

const defaultProps = {
  eventType: 'MESSAGE_RECEIVED',
  label: 'MESSAGE_RECEIVED',
  enabled: false,
  forwardToWebhook: false,
  forwardToSocket: false,
  onChange: vi.fn(),
}

describe('EventToggle', () => {
  it('renders event type label', () => {
    render(<EventToggle {...defaultProps} />)
    expect(screen.getByText('MESSAGE_RECEIVED')).toBeInTheDocument()
  })

  it('renders enabled/webhook/socket checkboxes', () => {
    render(<EventToggle {...defaultProps} />)
    expect(screen.getByLabelText('MESSAGE_RECEIVED enabled')).toBeInTheDocument()
    expect(screen.getByLabelText('MESSAGE_RECEIVED forward to webhook')).toBeInTheDocument()
    expect(screen.getByLabelText('MESSAGE_RECEIVED forward to socket')).toBeInTheDocument()
  })

  it('calls onChange when enabled checkbox clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<EventToggle {...defaultProps} onChange={onChange} />)

    const enabledCheckbox = screen.getByLabelText('MESSAGE_RECEIVED enabled')
    await user.click(enabledCheckbox)

    expect(onChange).toHaveBeenCalledWith('enabled', true)
  })

  it('calls onChange when webhook checkbox clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<EventToggle {...defaultProps} onChange={onChange} />)

    const webhookCheckbox = screen.getByLabelText('MESSAGE_RECEIVED forward to webhook')
    await user.click(webhookCheckbox)

    expect(onChange).toHaveBeenCalledWith('forwardToWebhook', true)
  })

  it('calls onChange when socket checkbox clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<EventToggle {...defaultProps} onChange={onChange} />)

    const socketCheckbox = screen.getByLabelText('MESSAGE_RECEIVED forward to socket')
    await user.click(socketCheckbox)

    expect(onChange).toHaveBeenCalledWith('forwardToSocket', true)
  })

  it('shows saving state', () => {
    render(<EventToggle {...defaultProps} saving={true} />)
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('disables checkboxes when saving', () => {
    render(<EventToggle {...defaultProps} saving={true} />)
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => {
      expect(cb).toBeDisabled()
    })
  })

  it('uses data-testid on root div', () => {
    render(<EventToggle {...defaultProps} />)
    expect(screen.getByTestId('event-toggle-MESSAGE_RECEIVED')).toBeInTheDocument()
  })
})

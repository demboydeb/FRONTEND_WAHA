import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal } from '@/components/common/ConfirmModal'

const defaultProps = {
  open: true,
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('ConfirmModal', () => {
  it('renders title and message', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
  })

  it('cancel calls onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />)
    await user.click(screen.getByTestId('cancel-btn'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('confirm calls onConfirm', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />)
    await user.click(screen.getByTestId('confirm-btn'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('does not execute action on cancel', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} onCancel={onCancel} />)
    await user.click(screen.getByTestId('cancel-btn'))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows loading state on confirm button', () => {
    render(<ConfirmModal {...defaultProps} loading={true} />)
    const confirmBtn = screen.getByTestId('confirm-btn')
    expect(confirmBtn).toBeDisabled()
  })

  it('does not render when closed', () => {
    render(<ConfirmModal {...defaultProps} open={false} />)
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument()
  })
})

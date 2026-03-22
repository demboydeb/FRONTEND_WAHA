import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// We test the ToastItem in isolation by rendering it with the UI store
// We need to set up the store with a toast and verify removal

// Import the store and the component
import { useUIStore } from '@/stores/ui.store'
import { ToastContainer } from '@/components/common/Toast'

const renderWithToast = () => {
  const { result } = { result: { current: useUIStore.getState() } }
  return result
}

describe('Toast', () => {
  beforeEach(() => {
    // Reset the store state
    useUIStore.setState({ toasts: [] })
  })

  it('renders toast with title', () => {
    act(() => {
      useUIStore.getState().addToast({ type: 'success', title: 'Hello Toast' })
    })

    render(<ToastContainer />)
    expect(screen.getByText('Hello Toast')).toBeInTheDocument()
  })

  it('renders different types - success', () => {
    act(() => {
      useUIStore.getState().addToast({ type: 'success', title: 'Success message' })
    })
    render(<ToastContainer />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('renders different types - error', () => {
    act(() => {
      useUIStore.getState().addToast({ type: 'error', title: 'Error message' })
    })
    render(<ToastContainer />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('renders different types - warning', () => {
    act(() => {
      useUIStore.getState().addToast({ type: 'warning', title: 'Warning message' })
    })
    render(<ToastContainer />)
    expect(screen.getByText('Warning message')).toBeInTheDocument()
  })

  it('renders different types - info', () => {
    act(() => {
      useUIStore.getState().addToast({ type: 'info', title: 'Info message' })
    })
    render(<ToastContainer />)
    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it('auto-removes after duration', async () => {
    vi.useFakeTimers()

    act(() => {
      useUIStore.getState().addToast({ type: 'success', title: 'Auto remove', duration: 1000 })
    })

    render(<ToastContainer />)
    expect(screen.getByText('Auto remove')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(1100)
    })

    expect(screen.queryByText('Auto remove')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('dismiss on click', async () => {
    const user = userEvent.setup()

    act(() => {
      useUIStore.getState().addToast({ type: 'info', title: 'Dismiss me' })
    })

    render(<ToastContainer />)
    expect(screen.getByText('Dismiss me')).toBeInTheDocument()

    const dismissBtn = screen.getByRole('button', { name: /dismiss/i })
    await user.click(dismissBtn)

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument()
  })
})

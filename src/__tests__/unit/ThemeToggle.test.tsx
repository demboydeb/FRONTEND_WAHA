import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/layout/Header'

const mockSetTheme = vi.fn()

vi.mock('@/stores/ui.store', () => ({
  useUIStore: vi.fn((selector: (s: {
    toggleSidebar: () => void
    theme: 'dark' | 'light'
    setTheme: (t: 'dark' | 'light') => void
  }) => unknown) =>
    selector({
      toggleSidebar: vi.fn(),
      theme: 'dark',
      setTheme: mockSetTheme,
    })
  ),
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((selector: (s: { user: null }) => unknown) =>
    selector({ user: null })
  ),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    render(<Header />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('calls setTheme on click', async () => {
    const user = userEvent.setup()
    render(<Header />)
    const toggle = screen.getByTestId('theme-toggle')
    await user.click(toggle)
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('has aria-label indicating current theme action', () => {
    render(<Header />)
    const toggle = screen.getByTestId('theme-toggle')
    expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme')
  })
})

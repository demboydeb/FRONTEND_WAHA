import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThrottleSettings } from '@/components/antiban/ThrottleSettings'

vi.mock('@/services/api', () => ({
  default: {
    put: vi.fn().mockResolvedValue({ data: {} }),
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

describe('ThrottleSettings (integration)', () => {
  beforeEach(() => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: {} })
  })

  it('renders all slider inputs', () => {
    render(<ThrottleSettings sessionId="sess-1" />, { wrapper: makeWrapper() })
    expect(screen.getByTestId('throttle-settings')).toBeInTheDocument()
    expect(screen.getByTestId('slider-delay-min')).toBeInTheDocument()
    expect(screen.getByTestId('slider-delay-max')).toBeInTheDocument()
    expect(screen.getByTestId('slider-pause-count')).toBeInTheDocument()
    expect(screen.getByTestId('slider-hours-start')).toBeInTheDocument()
    expect(screen.getByTestId('slider-hours-end')).toBeInTheDocument()
  })

  it('shows save button', () => {
    render(<ThrottleSettings sessionId="sess-1" />, { wrapper: makeWrapper() })
    expect(screen.getByTestId('save-throttle')).toBeInTheDocument()
  })

  it('save button calls API with correct values', async () => {
    render(<ThrottleSettings sessionId="sess-1" />, { wrapper: makeWrapper() })

    const saveBtn = screen.getByTestId('save-throttle')
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        '/sessions/sess-1/throttle-config',
        expect.objectContaining({
          delayMinMs: expect.any(Number),
          delayMaxMs: expect.any(Number),
          pauseAfterCount: expect.any(Number),
          activeHoursStart: expect.any(Number),
          activeHoursEnd: expect.any(Number),
        })
      )
    })
  })
})

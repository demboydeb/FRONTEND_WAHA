import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MediaConfigPanel } from '@/components/antiban/MediaConfigPanel'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

vi.mock('@/stores/ui.store', () => ({
  useUIStore: vi.fn((selector: (s: { addToast: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ addToast: vi.fn() })
  ),
}))

import apiClient from '@/services/api'

const mockConfig = {
  mediaDownloadEnabled: true,
  mediaDownloadTypes: ['image', 'audio', 'video', 'document'],
  mediaDownloadFromMe: false,
  mediaTtlSeconds: 3600,
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('MediaConfigPanel', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { config: mockConfig } })
    vi.mocked(apiClient.put).mockResolvedValue({ data: {} })
  })

  it('renders toggle for mediaDownloadEnabled', async () => {
    render(<MediaConfigPanel sessionId="sess-1" />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByTestId('media-config')).toBeInTheDocument()
    })
    // The toggle for enable/disable is a button with role=switch
    const toggles = screen.getAllByRole('switch')
    expect(toggles.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Enable Media Download')).toBeInTheDocument()
  })

  it('renders type checkboxes', async () => {
    render(<MediaConfigPanel sessionId="sess-1" />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByLabelText(/image/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/audio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/video/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/document/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sticker/i)).toBeInTheDocument()
  })

  it('slider renders', async () => {
    render(<MediaConfigPanel sessionId="sess-1" />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '300')
    expect(slider).toHaveAttribute('max', '86400')
  })

  it('renders save button', async () => {
    render(<MediaConfigPanel sessionId="sess-1" />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByTestId('save-media-config')).toBeInTheDocument()
    })
  })

  it('renders Download from Me toggle', async () => {
    render(<MediaConfigPanel sessionId="sess-1" />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Download from Me')).toBeInTheDocument()
    })
  })
})

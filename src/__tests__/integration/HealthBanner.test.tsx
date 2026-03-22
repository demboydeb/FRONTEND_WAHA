import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AntiBanPage } from '@/pages/AntiBanPage'
import type { HealthScore, WarmupStatus } from '@/types'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

import apiClient from '@/services/api'

const criticalHealth: HealthScore = {
  score: 15,
  status: 'CRITICAL',
  deliveryRate: 0.4,
  responseRate: 0.1,
  reportRate: 0.12,
  recommendation: 'Stop messaging immediately',
  calculatedAt: new Date().toISOString(),
}

const healthyHealth: HealthScore = {
  score: 92,
  status: 'HEALTHY',
  deliveryRate: 0.99,
  responseRate: 0.65,
  reportRate: 0.001,
  calculatedAt: new Date().toISOString(),
}

const warmupStatus: WarmupStatus = {
  phase: 'WARMING',
  ageInDays: 10,
  dailyLimit: 50,
  todayCount: 5,
}

function makeWrapper(health: HealthScore) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  // Set up mock responses based on URL
  vi.mocked(apiClient.get).mockImplementation((url: string) => {
    if (url.includes('health')) return Promise.resolve({ data: health })
    if (url.includes('warmup')) return Promise.resolve({ data: warmupStatus })
    if (url.includes('templates')) return Promise.resolve({ data: { templates: [] } })
    return Promise.resolve({ data: {} })
  })

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/sessions/sess-1/antiban']}>
        <Routes>
          <Route path="/sessions/:id/antiban" element={<AntiBanPage />} />
          <Route path="/sessions/:id" element={<div>Session</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('HealthBanner (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows warning banner when health is CRITICAL', async () => {
    render(makeWrapper(criticalHealth))
    await waitFor(() => {
      expect(screen.getByTestId('critical-banner')).toBeInTheDocument()
    })
    expect(screen.getByText('Critical Health Warning')).toBeInTheDocument()
  })

  it('does not show banner when HEALTHY', async () => {
    render(makeWrapper(healthyHealth))
    await waitFor(() => {
      // Wait for health data to load (gauge should show)
      expect(screen.getByTestId('health-gauge')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('critical-banner')).not.toBeInTheDocument()
  })
})

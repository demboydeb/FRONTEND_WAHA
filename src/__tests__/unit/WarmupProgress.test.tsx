import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WarmupProgress } from '@/components/antiban/WarmupProgress'
import type { WarmupStatus } from '@/types'

const baseStatus: WarmupStatus = {
  phase: 'WARMING',
  ageInDays: 10,
  dailyLimit: 50,
  todayCount: 12,
}

describe('WarmupProgress', () => {
  it('renders phase name', () => {
    render(<WarmupProgress status={baseStatus} />)
    expect(screen.getByTestId('warmup-phase')).toHaveTextContent('WARMING')
  })

  it('shows correct daily count text', () => {
    render(<WarmupProgress status={baseStatus} />)
    const counter = screen.getByTestId('daily-counter')
    expect(counter).toHaveTextContent('12')
    expect(counter).toHaveTextContent('50')
  })

  it('shows next phase info when provided', () => {
    render(<WarmupProgress status={{ ...baseStatus, nextPhaseIn: 5 }} />)
    expect(screen.getByText(/Next phase in/i)).toBeInTheDocument()
    expect(screen.getByText('5 days')).toBeInTheDocument()
  })

  it('does not show next phase info when not provided', () => {
    render(<WarmupProgress status={baseStatus} />)
    expect(screen.queryByText(/Next phase in/i)).not.toBeInTheDocument()
  })

  it('renders PASSIVE phase correctly', () => {
    render(
      <WarmupProgress status={{ ...baseStatus, phase: 'PASSIVE', ageInDays: 3 }} />
    )
    expect(screen.getByTestId('warmup-phase')).toHaveTextContent('PASSIVE')
  })

  it('renders GROWING phase correctly', () => {
    render(
      <WarmupProgress status={{ ...baseStatus, phase: 'GROWING', ageInDays: 40 }} />
    )
    expect(screen.getByTestId('warmup-phase')).toHaveTextContent('GROWING')
  })

  it('renders ESTABLISHED phase correctly', () => {
    render(
      <WarmupProgress status={{ ...baseStatus, phase: 'ESTABLISHED', ageInDays: 100 }} />
    )
    expect(screen.getByTestId('warmup-phase')).toHaveTextContent('ESTABLISHED')
  })

  it('shows correct daily usage bar at 80% when 80/100 sent', () => {
    render(
      <WarmupProgress
        status={{ ...baseStatus, todayCount: 80, dailyLimit: 100 }}
      />
    )
    const counter = screen.getByTestId('daily-counter')
    expect(counter).toHaveTextContent('80')
    expect(counter).toHaveTextContent('100')
  })
})

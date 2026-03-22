import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthGauge } from '@/components/antiban/HealthGauge'

describe('HealthGauge', () => {
  it('renders correctly for score 0', () => {
    render(<HealthGauge score={0} status="CRITICAL" />)
    expect(screen.getByTestId('health-gauge')).toBeInTheDocument()
    expect(screen.getByTestId('health-score')).toHaveTextContent('0')
  })

  it('renders correctly for score 50', () => {
    render(<HealthGauge score={50} status="WARNING" />)
    expect(screen.getByTestId('health-score')).toHaveTextContent('50')
    expect(screen.getByTestId('health-status')).toHaveTextContent('WARNING')
  })

  it('renders correctly for score 100', () => {
    render(<HealthGauge score={100} status="HEALTHY" />)
    expect(screen.getByTestId('health-score')).toHaveTextContent('100')
    expect(screen.getByTestId('health-status')).toHaveTextContent('HEALTHY')
  })

  it('shows HEALTHY status with green color indication', () => {
    render(<HealthGauge score={90} status="HEALTHY" />)
    const statusEl = screen.getByTestId('health-status')
    expect(statusEl).toHaveTextContent('HEALTHY')
    expect(statusEl).toHaveStyle({ color: '#22c55e' })
  })

  it('shows WARNING status', () => {
    render(<HealthGauge score={60} status="WARNING" />)
    const statusEl = screen.getByTestId('health-status')
    expect(statusEl).toHaveTextContent('WARNING')
    expect(statusEl).toHaveStyle({ color: '#eab308' })
  })

  it('shows CRITICAL status', () => {
    render(<HealthGauge score={20} status="CRITICAL" />)
    const statusEl = screen.getByTestId('health-status')
    expect(statusEl).toHaveTextContent('CRITICAL')
    expect(statusEl).toHaveStyle({ color: '#ef4444' })
  })
})

import React from 'react'

interface HealthGaugeProps {
  score: number
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
}

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const STATUS_COLORS: Record<HealthGaugeProps['status'], string> = {
  HEALTHY: '#22c55e',
  WARNING: '#eab308',
  CRITICAL: '#ef4444',
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score, status }) => {
  const clampedScore = Math.max(0, Math.min(100, score))
  const dashOffset = CIRCUMFERENCE * (1 - clampedScore / 100)
  const color = STATUS_COLORS[status]

  return (
    <div data-testid="health-gauge" className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-label={`Health score: ${score}`}>
        {/* Background track */}
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="#252b3b"
          strokeWidth="10"
        />
        {/* Animated progress arc */}
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Score number in center */}
        <text
          x="60"
          y="65"
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill={color}
          data-testid="health-score"
        >
          {clampedScore}
        </text>
      </svg>
      <span
        data-testid="health-status"
        className="text-sm font-semibold"
        style={{ color }}
      >
        {status}
      </span>
    </div>
  )
}

export default HealthGauge

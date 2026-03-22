import React from 'react'
import type { WarmupStatus } from '@/types'

interface WarmupProgressProps {
  status: WarmupStatus
}

type Phase = WarmupStatus['phase']

const PHASE_COLORS: Record<Phase, string> = {
  PASSIVE: '#6b7280',
  WARMING: '#3b82f6',
  GROWING: '#06b6d4',
  ESTABLISHED: '#22c55e',
  FULL: '#a855f7',
}

// Days threshold marking when each phase starts
const PHASE_THRESHOLDS: Record<Phase, number> = {
  PASSIVE: 0,
  WARMING: 7,
  GROWING: 30,
  ESTABLISHED: 90,
  FULL: 180,
}

// Total expected days for full progress (max phase end)
const MAX_DAYS = 180

function getProgressPercent(phase: Phase, ageInDays: number): number {
  const start = PHASE_THRESHOLDS[phase]
  // Next phase threshold or max
  const phaseOrder: Phase[] = ['PASSIVE', 'WARMING', 'GROWING', 'ESTABLISHED', 'FULL']
  const idx = phaseOrder.indexOf(phase)
  const end = idx < phaseOrder.length - 1 ? PHASE_THRESHOLDS[phaseOrder[idx + 1]] : MAX_DAYS

  if (phase === 'FULL') {
    // Full is max
    return 100
  }

  const phaseLength = end - start
  const daysIntoPhase = Math.max(0, ageInDays - start)
  return Math.min(100, Math.round((daysIntoPhase / phaseLength) * 100))
}

export const WarmupProgress: React.FC<WarmupProgressProps> = ({ status }) => {
  const { phase, ageInDays, dailyLimit, todayCount, nextPhaseIn } = status
  const color = PHASE_COLORS[phase]
  const progressPercent = getProgressPercent(phase, ageInDays)
  const dailyPercent = dailyLimit > 0 ? Math.min(100, Math.round((todayCount / dailyLimit) * 100)) : 0

  return (
    <div data-testid="warmup-progress" className="flex flex-col gap-4">
      {/* Phase name */}
      <div className="flex items-center justify-between">
        <span
          data-testid="warmup-phase"
          className="text-lg font-bold"
          style={{ color }}
        >
          {phase}
        </span>
        <span className="text-sm text-[#5a6478]">{ageInDays} days old</span>
      </div>

      {/* Phase progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[#5a6478] mb-1">
          <span>Phase progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#252b3b] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Daily usage */}
      <div>
        <div
          data-testid="daily-counter"
          className="flex justify-between text-sm mb-1"
        >
          <span className="text-[#5a6478]">Today</span>
          <span className="text-[#e8ecf4] font-mono">
            {todayCount} / {dailyLimit} messages
          </span>
        </div>
        <div className="w-full h-2 bg-[#252b3b] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${dailyPercent}%`,
              backgroundColor: dailyPercent >= 90 ? '#ef4444' : dailyPercent >= 70 ? '#eab308' : color,
            }}
          />
        </div>
      </div>

      {/* Next phase info */}
      {nextPhaseIn !== undefined && nextPhaseIn !== null && (
        <p className="text-xs text-[#5a6478]">
          Next phase in{' '}
          <span className="text-[#e8ecf4] font-medium">{nextPhaseIn} days</span>
        </p>
      )}
    </div>
  )
}

export default WarmupProgress

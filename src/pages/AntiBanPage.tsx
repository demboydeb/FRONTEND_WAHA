import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { HealthGauge } from '@/components/antiban/HealthGauge'
import { WarmupProgress } from '@/components/antiban/WarmupProgress'
import { ThrottleSettings } from '@/components/antiban/ThrottleSettings'
import { TemplateEditor } from '@/components/antiban/TemplateEditor'
import apiClient from '@/services/api'
import type { HealthScore, WarmupStatus } from '@/types'

// Fake 30-day health history data (no API endpoint exists yet)
function generateFakeHistory(): { day: string; score: number }[] {
  const data: { day: string; score: number }[] = []
  let score = 72
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    score = Math.max(20, Math.min(100, score + Math.round((Math.random() - 0.45) * 8)))
    data.push({
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score,
    })
  }
  return data
}

const HISTORY_DATA = generateFakeHistory()

export const AntiBanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['health', id],
    queryFn: async () => {
      const res = await apiClient.get<HealthScore>(`/sessions/${id}/health`)
      return res.data
    },
    enabled: !!id,
    refetchInterval: 30_000,
  })

  const { data: warmupData, isLoading: warmupLoading } = useQuery({
    queryKey: ['warmup', id],
    queryFn: async () => {
      const res = await apiClient.get<WarmupStatus>(`/sessions/${id}/warmup-status`)
      return res.data
    },
    enabled: !!id,
    refetchInterval: 60_000,
  })

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444]">No session ID provided</p>
      </div>
    )
  }

  const isCritical = healthData?.status === 'CRITICAL'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/sessions/${id}`)}
          className="text-sm text-[#5a6478] hover:text-[#e8ecf4] transition-colors"
        >
          ← Back to Session
        </button>
        <h1 className="text-2xl font-semibold text-[#e8ecf4]">Anti-Ban Dashboard</h1>
      </div>

      {/* Critical warning banner */}
      {isCritical && (
        <div
          data-testid="critical-banner"
          className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-[10px] px-4 py-3 flex items-start gap-3"
        >
          <svg className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#ef4444]">Critical Health Warning</p>
            <p className="text-xs text-[#ef4444]/80 mt-0.5">
              {healthData?.recommendation ?? 'Your account health is critical. Reduce messaging frequency immediately.'}
            </p>
          </div>
        </div>
      )}

      {/* Top section: HealthGauge + stats */}
      <Card>
        {healthLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : healthData ? (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <HealthGauge score={healthData.score} status={healthData.status} />

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Delivery Rate', value: `${Math.round(healthData.deliveryRate * 100)}%` },
                { label: 'Response Rate', value: `${Math.round(healthData.responseRate * 100)}%` },
                { label: 'Report Rate', value: `${Math.round(healthData.reportRate * 100)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#0a0c10] rounded-[8px] p-3 text-center">
                  <p className="text-xs text-[#5a6478] mb-1">{label}</p>
                  <p className="text-lg font-bold text-[#e8ecf4]">{value}</p>
                </div>
              ))}
            </div>

            {healthData.recommendation && (
              <div className="w-full md:w-56 bg-[#0a0c10] rounded-[8px] p-3">
                <p className="text-xs text-[#5a6478] mb-1 font-semibold uppercase tracking-wide">
                  Recommendation
                </p>
                <p className="text-xs text-[#e8ecf4]">{healthData.recommendation}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#5a6478] text-center py-4">No health data available</p>
        )}
      </Card>

      {/* Health history chart */}
      <Card>
        <h2 className="text-sm font-semibold text-[#e8ecf4] mb-4">Health Score — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={HISTORY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fill: '#5a6478', fontSize: 10 }}
              interval={6}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#5a6478', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#161a24', border: '1px solid #252b3b', borderRadius: 8 }}
              labelStyle={{ color: '#5a6478', fontSize: 11 }}
              itemStyle={{ color: '#22c55e', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#healthGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Middle row: Warmup + Throttle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Warmup progress */}
        <Card>
          <h2 className="text-sm font-semibold text-[#e8ecf4] mb-4">Warmup Status</h2>
          {warmupLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : warmupData ? (
            <WarmupProgress status={warmupData} />
          ) : (
            <p className="text-sm text-[#5a6478]">No warmup data available</p>
          )}
        </Card>

        {/* Right: Throttle settings */}
        <Card>
          <ThrottleSettings sessionId={id} />
        </Card>
      </div>

      {/* Bottom: Template editor */}
      <Card>
        <h2 className="text-sm font-semibold text-[#e8ecf4] mb-4">Message Templates</h2>
        <TemplateEditor sessionId={id} />
      </Card>
    </div>
  )
}

export default AntiBanPage

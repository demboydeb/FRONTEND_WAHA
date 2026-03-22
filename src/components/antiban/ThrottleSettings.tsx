import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import apiClient from '@/services/api'
import { useUIStore } from '@/stores/ui.store'

interface ThrottleConfig {
  delayMinMs: number
  delayMaxMs: number
  pauseAfterCount: number
  activeHoursStart: number
  activeHoursEnd: number
}

interface ThrottleSettingsProps {
  sessionId: string
}

const DEFAULT_CONFIG: ThrottleConfig = {
  delayMinMs: 1000,
  delayMaxMs: 3000,
  pauseAfterCount: 20,
  activeHoursStart: 8,
  activeHoursEnd: 22,
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  onChange: (v: number) => void
  testId?: string
}

const SliderField: React.FC<SliderFieldProps> = ({ label, value, min, max, unit = '', onChange, testId }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-sm">
      <label className="text-[#5a6478]">{label}</label>
      <span className="text-[#e8ecf4] font-mono">
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      data-testid={testId}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#22c55e] cursor-pointer"
    />
    <div className="flex justify-between text-xs text-[#5a6478]">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
)

export const ThrottleSettings: React.FC<ThrottleSettingsProps> = ({ sessionId }) => {
  const [config, setConfig] = useState<ThrottleConfig>(DEFAULT_CONFIG)
  const addToast = useUIStore((s) => s.addToast)

  const saveMutation = useMutation({
    mutationFn: async (cfg: ThrottleConfig) => {
      const res = await apiClient.put(`/sessions/${sessionId}/throttle-config`, cfg)
      return res.data
    },
    onSuccess: () => {
      addToast({ type: 'success', title: 'Saved!' })
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to save throttle config' })
    },
  })

  const set = <K extends keyof ThrottleConfig>(key: K, value: ThrottleConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div data-testid="throttle-settings" className="flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-[#e8ecf4]">Throttle Settings</h3>

      <SliderField
        label="Min delay between messages"
        value={config.delayMinMs}
        min={100}
        max={5000}
        unit="ms"
        testId="slider-delay-min"
        onChange={(v) => set('delayMinMs', v)}
      />

      <SliderField
        label="Max delay between messages"
        value={config.delayMaxMs}
        min={500}
        max={30000}
        unit="ms"
        testId="slider-delay-max"
        onChange={(v) => set('delayMaxMs', v)}
      />

      <SliderField
        label="Pause after N messages"
        value={config.pauseAfterCount}
        min={1}
        max={100}
        testId="slider-pause-count"
        onChange={(v) => set('pauseAfterCount', v)}
      />

      <SliderField
        label="Active hours start"
        value={config.activeHoursStart}
        min={0}
        max={23}
        unit=":00"
        testId="slider-hours-start"
        onChange={(v) => set('activeHoursStart', v)}
      />

      <SliderField
        label="Active hours end"
        value={config.activeHoursEnd}
        min={0}
        max={23}
        unit=":00"
        testId="slider-hours-end"
        onChange={(v) => set('activeHoursEnd', v)}
      />

      <button
        data-testid="save-throttle"
        onClick={() => saveMutation.mutate(config)}
        disabled={saveMutation.isPending}
        className="mt-2 px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white text-sm font-medium rounded-[8px] transition-colors"
      >
        {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}

export default ThrottleSettings

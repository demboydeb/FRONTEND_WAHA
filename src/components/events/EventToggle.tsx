import React from 'react'

interface EventToggleProps {
  eventType: string
  label: string
  enabled: boolean
  forwardToWebhook: boolean
  forwardToSocket: boolean
  onChange: (field: 'enabled' | 'forwardToWebhook' | 'forwardToSocket', value: boolean) => void
  saving?: boolean
}

export const EventToggle: React.FC<EventToggleProps> = ({
  eventType,
  label,
  enabled,
  forwardToWebhook,
  forwardToSocket,
  onChange,
  saving = false,
}) => {
  return (
    <div
      data-testid={`event-toggle-${eventType}`}
      className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#252b3b] bg-[#11141b]"
    >
      <span className="text-sm text-[#e8ecf4] font-mono">{label}</span>

      <div className="flex items-center gap-4">
        {saving && (
          <span className="text-xs text-[#5a6478] animate-pulse">Saving...</span>
        )}

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            disabled={saving}
            onChange={(e) => onChange('enabled', e.target.checked)}
            className="w-4 h-4 rounded accent-[#22c55e] cursor-pointer disabled:cursor-not-allowed"
            aria-label={`${label} enabled`}
          />
          <span className="text-xs text-[#5a6478]">Enabled</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={forwardToWebhook}
            disabled={saving}
            onChange={(e) => onChange('forwardToWebhook', e.target.checked)}
            className="w-4 h-4 rounded accent-[#22c55e] cursor-pointer disabled:cursor-not-allowed"
            aria-label={`${label} forward to webhook`}
          />
          <span className="text-xs text-[#5a6478]">Webhook</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={forwardToSocket}
            disabled={saving}
            onChange={(e) => onChange('forwardToSocket', e.target.checked)}
            className="w-4 h-4 rounded accent-[#22c55e] cursor-pointer disabled:cursor-not-allowed"
            aria-label={`${label} forward to socket`}
          />
          <span className="text-xs text-[#5a6478]">Socket</span>
        </label>
      </div>
    </div>
  )
}

export default EventToggle

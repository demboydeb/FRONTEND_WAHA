import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { useUIStore } from '@/stores/ui.store'
import apiClient from '@/services/api'
import type { MediaConfig } from '@/types'

interface MediaConfigPanelProps {
  sessionId: string
}

const MEDIA_TYPES = ['image', 'audio', 'video', 'document', 'sticker'] as const

function formatTtl(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

export const MediaConfigPanel: React.FC<MediaConfigPanelProps> = ({ sessionId }) => {
  const addToast = useUIStore((s) => s.addToast)

  const [config, setConfig] = useState<MediaConfig>({
    mediaDownloadEnabled: true,
    mediaDownloadTypes: ['image', 'audio', 'video', 'document'],
    mediaDownloadFromMe: false,
    mediaTtlSeconds: 3600,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['media-config', sessionId],
    queryFn: async () => {
      const res = await apiClient.get<{ config: MediaConfig }>(
        `/sessions/${sessionId}/media-config`
      )
      return res.data.config
    },
    enabled: !!sessionId,
  })

  useEffect(() => {
    if (data) setConfig(data)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (payload: MediaConfig) =>
      apiClient.put(`/sessions/${sessionId}/media-config`, payload),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Media config saved' })
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to save media config' })
    },
  })

  const toggleType = (type: string) => {
    setConfig((prev) => ({
      ...prev,
      mediaDownloadTypes: prev.mediaDownloadTypes.includes(type)
        ? prev.mediaDownloadTypes.filter((t) => t !== type)
        : [...prev.mediaDownloadTypes, type],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    )
  }

  return (
    <div data-testid="media-config" className="space-y-5">
      {/* Enable/disable toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#e8ecf4]">Enable Media Download</p>
          <p className="text-xs text-[#5a6478]">Download media attachments automatically</p>
        </div>
        <button
          role="switch"
          aria-checked={config.mediaDownloadEnabled}
          onClick={() =>
            setConfig((prev) => ({ ...prev, mediaDownloadEnabled: !prev.mediaDownloadEnabled }))
          }
          className={[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            config.mediaDownloadEnabled ? 'bg-[#22c55e]' : 'bg-[#252b3b]',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              config.mediaDownloadEnabled ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
        </button>
      </div>

      {/* Media types */}
      <div>
        <p className="text-sm font-medium text-[#e8ecf4] mb-2">Media Types</p>
        <div className="flex flex-wrap gap-3">
          {MEDIA_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.mediaDownloadTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="w-4 h-4 rounded accent-[#22c55e]"
              />
              <span className="text-sm text-[#e8ecf4] capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Download from me toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#e8ecf4]">Download from Me</p>
          <p className="text-xs text-[#5a6478]">Download media you send yourself</p>
        </div>
        <button
          role="switch"
          aria-checked={config.mediaDownloadFromMe}
          onClick={() =>
            setConfig((prev) => ({ ...prev, mediaDownloadFromMe: !prev.mediaDownloadFromMe }))
          }
          className={[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            config.mediaDownloadFromMe ? 'bg-[#22c55e]' : 'bg-[#252b3b]',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              config.mediaDownloadFromMe ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
        </button>
      </div>

      {/* TTL slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#e8ecf4]">Media TTL</p>
          <span className="text-sm font-mono text-[#22c55e]">
            {formatTtl(config.mediaTtlSeconds)}
          </span>
        </div>
        <input
          type="range"
          min={300}
          max={86400}
          step={300}
          value={config.mediaTtlSeconds}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, mediaTtlSeconds: Number(e.target.value) }))
          }
          className="w-full accent-[#22c55e]"
        />
        <div className="flex justify-between text-xs text-[#5a6478] mt-1">
          <span>5m</span>
          <span>24h</span>
        </div>
      </div>

      <Button
        data-testid="save-media-config"
        onClick={() => saveMutation.mutate(config)}
        loading={saveMutation.isPending}
      >
        Save Configuration
      </Button>
    </div>
  )
}

export default MediaConfigPanel

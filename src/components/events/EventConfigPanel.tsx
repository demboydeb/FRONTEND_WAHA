import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/common/Card'
import { EventToggle } from '@/components/events/EventToggle'
import { Spinner } from '@/components/common/Spinner'
import apiClient from '@/services/api'
import type { EventConfig } from '@/types'

interface EventConfigPanelProps {
  sessionId: string
}

const EVENT_GROUPS: Record<string, { eventType: string; label: string }[]> = {
  Messages: [
    { eventType: 'MESSAGE_RECEIVED', label: 'MESSAGE_RECEIVED' },
    { eventType: 'MESSAGE_SENT', label: 'MESSAGE_SENT' },
    { eventType: 'MESSAGE_UPDATE', label: 'MESSAGE_UPDATE' },
  ],
  Presence: [
    { eventType: 'PRESENCE_UPDATE', label: 'PRESENCE_UPDATE' },
    { eventType: 'CONTACTS_UPDATE', label: 'CONTACTS_UPDATE' },
  ],
  Groups: [
    { eventType: 'GROUP_PARTICIPANTS_UPDATE', label: 'GROUP_PARTICIPANTS_UPDATE' },
  ],
  Connection: [
    { eventType: 'CONNECTION_UPDATE', label: 'CONNECTION_UPDATE' },
  ],
  Calls: [
    { eventType: 'CALL_RECEIVED', label: 'CALL_RECEIVED' },
    { eventType: 'BLOCKLIST_UPDATE', label: 'BLOCKLIST_UPDATE' },
  ],
}

export const EventConfigPanel: React.FC<EventConfigPanelProps> = ({ sessionId }) => {
  const queryClient = useQueryClient()
  const [savingEvent, setSavingEvent] = React.useState<string | null>(null)

  const { data: events, isLoading } = useQuery<EventConfig[]>({
    queryKey: ['events', sessionId],
    queryFn: async () => {
      const response = await apiClient.get<{ configs: EventConfig[] }>(`/sessions/${sessionId}/events`)
      return response.data.configs ?? []
    },
    enabled: !!sessionId,
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      eventType: string
      enabled?: boolean
      forwardToWebhook?: boolean
      forwardToSocket?: boolean
    }) => {
      const response = await apiClient.put(`/sessions/${sessionId}/events`, payload)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events', sessionId] })
      setSavingEvent(null)
    },
    onError: () => {
      setSavingEvent(null)
    },
  })

  const handleChange = (
    eventType: string,
    field: 'enabled' | 'forwardToWebhook' | 'forwardToSocket',
    value: boolean
  ) => {
    setSavingEvent(eventType)
    updateMutation.mutate({ eventType, [field]: value })
  }

  const getEventConfig = (eventType: string): EventConfig => {
    const found = events?.find((e) => e.eventType === eventType)
    return (
      found ?? {
        id: '',
        sessionId,
        eventType,
        enabled: false,
        forwardToWebhook: false,
        forwardToSocket: false,
        filterOwn: false,
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(EVENT_GROUPS).map(([groupName, groupEvents]) => (
        <Card key={groupName}>
          <h3 className="text-sm font-semibold text-[#e8ecf4] mb-3">{groupName}</h3>
          <div className="flex flex-col gap-2">
            {groupEvents.map(({ eventType, label }) => {
              const config = getEventConfig(eventType)
              return (
                <EventToggle
                  key={eventType}
                  eventType={eventType}
                  label={label}
                  enabled={config.enabled}
                  forwardToWebhook={config.forwardToWebhook}
                  forwardToSocket={config.forwardToSocket}
                  saving={savingEvent === eventType}
                  onChange={(field, value) => handleChange(eventType, field, value)}
                />
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default EventConfigPanel

import React, { useState, useEffect, useRef } from 'react'
import socketService from '@/services/socket'

interface ActivityFeedProps {
  sessionId: string
}

interface FeedEvent {
  id: string
  type: string
  timestamp: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

const TRACKED_EVENTS = [
  'MESSAGE_RECEIVED',
  'MESSAGE_SENT',
  'CONNECTION_UPDATE',
  'PRESENCE_UPDATE',
  'GROUP_PARTICIPANTS_UPDATE',
  'CALL',
  'session:qr',
  'session:status',
  'session:connected',
  'session:disconnected',
]

const TYPE_COLORS: Record<string, string> = {
  MESSAGE_RECEIVED: '#22c55e',
  MESSAGE_SENT: '#3b82f6',
  CONNECTION_UPDATE: '#eab308',
  PRESENCE_UPDATE: '#8b5cf6',
  GROUP_PARTICIPANTS_UPDATE: '#f97316',
  CALL: '#ef4444',
  'session:qr': '#06b6d4',
  'session:status': '#64748b',
  'session:connected': '#22c55e',
  'session:disconnected': '#ef4444',
}

let feedEventCounter = 0

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ sessionId }) => {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlers: Array<{ event: string; handler: (...args: unknown[]) => void }> = []

    TRACKED_EVENTS.forEach((eventType) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (...args: any[]) => {
        const payload = args[0]
        // Only track events for this session if they have a sessionId field
        if (payload && typeof payload === 'object' && 'sessionId' in payload) {
          if (payload.sessionId !== sessionId) return
        }

        setEvents((prev) => {
          const newEvent: FeedEvent = {
            id: `feed-${++feedEventCounter}`,
            type: eventType,
            timestamp: new Date(),
            data: payload,
          }
          const updated = [...prev, newEvent]
          return updated.slice(-50)
        })
      }

      socketService.on(eventType, handler)
      handlers.push({ event: eventType, handler })
    })

    return () => {
      handlers.forEach(({ event, handler }) => {
        socketService.off(event, handler)
      })
    }
  }, [sessionId])

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [events])

  const filteredEvents = activeFilter
    ? events.filter((e) => e.type === activeFilter)
    : events

  const usedTypes = Array.from(new Set(events.map((e) => e.type)))

  return (
    <div data-testid="activity-feed" className="flex flex-col gap-3">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter(null)}
          className={[
            'px-2 py-1 text-xs rounded border transition-colors',
            activeFilter === null
              ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
              : 'border-[#252b3b] text-[#5a6478] hover:border-[#3b4460]',
          ].join(' ')}
        >
          All
        </button>
        {TRACKED_EVENTS.map((eventType) => (
          <button
            key={eventType}
            onClick={() => setActiveFilter(activeFilter === eventType ? null : eventType)}
            className={[
              'px-2 py-1 text-xs rounded border transition-colors',
              activeFilter === eventType
                ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                : usedTypes.includes(eventType)
                ? 'border-[#252b3b] text-[#e8ecf4] hover:border-[#3b4460]'
                : 'border-[#252b3b] text-[#5a6478] hover:border-[#3b4460]',
            ].join(' ')}
          >
            {eventType}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="bg-[#11141b] border border-[#252b3b] rounded-lg h-[400px] overflow-y-auto p-2 flex flex-col gap-1">
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[#5a6478]">No events yet...</p>
          </div>
        ) : (
          <>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                data-testid="activity-event"
                className="flex items-start gap-2 p-2 rounded border border-[#252b3b] bg-[#161a24]"
              >
                <span
                  className="px-1.5 py-0.5 text-xs rounded font-mono whitespace-nowrap"
                  style={{
                    color: TYPE_COLORS[event.type] ?? '#e8ecf4',
                    borderColor: TYPE_COLORS[event.type] ?? '#252b3b',
                    border: '1px solid',
                    backgroundColor: `${TYPE_COLORS[event.type] ?? '#252b3b'}20`,
                  }}
                >
                  {event.type}
                </span>
                <span className="text-xs text-[#5a6478] whitespace-nowrap">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                <span className="text-xs text-[#8892a8] font-mono truncate flex-1">
                  {event.data ? JSON.stringify(event.data).slice(0, 120) : '—'}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  )
}

export default ActivityFeed

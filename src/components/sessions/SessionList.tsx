import React from 'react'
import { SessionCard } from './SessionCard'
import { Spinner } from '@/components/common/Spinner'
import type { Session } from '@/types'

interface SessionListProps {
  sessions: Session[]
  loading?: boolean
  onDisconnect?: (id: string) => void
  onDelete?: (id: string) => void
  onReconnect?: (id: string) => void
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  loading = false,
  onDisconnect,
  onDelete,
  onReconnect,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-[10px] bg-[#161a24] border border-[#252b3b] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#5a6478]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-[#e8ecf4] font-medium mb-1">No sessions yet</p>
        <p className="text-sm text-[#5a6478]">Create your first WhatsApp session to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="session-list">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onDisconnect={onDisconnect}
          onDelete={onDelete}
          onReconnect={onReconnect}
        />
      ))}
    </div>
  )
}

export default SessionList

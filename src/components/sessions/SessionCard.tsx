import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import type { Session, SessionStatus } from '@/types'

interface SessionCardProps {
  session: Session
  onDisconnect?: (id: string) => void
  onDelete?: (id: string) => void
  onReconnect?: (id: string) => void
}

const statusVariant: Record<SessionStatus, 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'gray' | 'cyan' | 'purple'> = {
  CONNECTED: 'green',
  INITIALIZING: 'blue',
  QR_PENDING: 'cyan',
  PAIRING: 'purple',
  DISCONNECTED: 'gray',
  RECONNECTING: 'orange',
  ERROR: 'red',
  BANNED: 'red',
}

const statusDot: Record<SessionStatus, string> = {
  CONNECTED: 'bg-[#22c55e]',
  INITIALIZING: 'bg-[#3b82f6] animate-pulse',
  QR_PENDING: 'bg-[#06b6d4] animate-pulse',
  PAIRING: 'bg-[#a855f7] animate-pulse',
  DISCONNECTED: 'bg-[#5a6478]',
  RECONNECTING: 'bg-[#f97316] animate-pulse',
  ERROR: 'bg-[#ef4444]',
  BANNED: 'bg-[#ef4444]',
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onDisconnect,
  onDelete,
  onReconnect,
}) => {
  const navigate = useNavigate()

  return (
    <div className="bg-[#161a24] border border-[#252b3b] rounded-[10px] p-4 hover:border-[#3b4460] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={['h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1', statusDot[session.status]].join(' ')} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#e8ecf4] truncate">{session.name}</h3>
            {session.phoneNumber && (
              <p className="text-xs text-[#5a6478] font-mono">{session.phoneNumber}</p>
            )}
            {session.description && (
              <p className="text-xs text-[#5a6478] truncate">{session.description}</p>
            )}
          </div>
        </div>
        <Badge variant={statusVariant[session.status]}>{session.status}</Badge>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/sessions/${session.id}`)}
        >
          Details
        </Button>
        {session.status === 'CONNECTED' && onDisconnect && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDisconnect(session.id)}
          >
            Disconnect
          </Button>
        )}
        {(session.status === 'DISCONNECTED' || session.status === 'ERROR') && onReconnect && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onReconnect(session.id)}
          >
            Reconnect
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(session.id)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}

export default SessionCard

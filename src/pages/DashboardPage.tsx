import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { useSessionStore } from '@/stores/session.store'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useSocket } from '@/hooks/useSocket'
import apiClient from '@/services/api'
import type { Session } from '@/types'

interface SessionsResponse {
  sessions: Session[]
  total: number
  page: number
  limit: number
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const sessions = useSessionStore((s) => s.sessions)
  const setSessions = useSessionStore((s) => s.setSessions)

  // Keep socket connected
  useSocket()

  const { isLoading } = useQuery({
    queryKey: ['sessions', 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<SessionsResponse>('/sessions', {
        params: { limit: 50 },
      })
      setSessions(response.data.sessions)
      return response.data
    },
  })

  const connected = sessions.filter((s) => s.status === 'CONNECTED').length
  const disconnected = sessions.filter((s) => s.status === 'DISCONNECTED').length
  const errored = sessions.filter((s) => s.status === 'ERROR' || s.status === 'BANNED').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#e8ecf4]">
          Welcome back, {user?.username ?? 'User'}
        </h1>
        <p className="text-sm text-[#5a6478] mt-1">
          WhatsApp multi-session overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#e8ecf4]">{isLoading ? '—' : sessions.length}</p>
              <p className="text-xs text-[#5a6478]">Total Sessions</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#22c55e]">{isLoading ? '—' : connected}</p>
              <p className="text-xs text-[#5a6478]">Connected</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#5a6478]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#5a6478]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#e8ecf4]">{isLoading ? '—' : disconnected}</p>
              <p className="text-xs text-[#5a6478]">Disconnected</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#ef4444]">{isLoading ? '—' : errored}</p>
              <p className="text-xs text-[#5a6478]">Error / Banned</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#e8ecf4]">Recent Sessions</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')}>
            View all →
          </Button>
        </div>

        {sessions.length === 0 && !isLoading ? (
          <Card>
            <p className="text-sm text-[#5a6478] text-center py-4">
              No sessions yet.{' '}
              <button
                className="text-[#22c55e] hover:underline"
                onClick={() => navigate('/sessions')}
              >
                Create one
              </button>
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sessions.slice(0, 6).map((session) => (
              <Card
                key={session.id}
                onClick={() => navigate(`/sessions/${session.id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#e8ecf4]">{session.name}</p>
                    <p className="text-xs text-[#5a6478] font-mono mt-0.5">
                      {session.phoneNumber ?? session.connectionMethod}
                    </p>
                  </div>
                  <Badge
                    variant={
                      session.status === 'CONNECTED'
                        ? 'green'
                        : session.status === 'ERROR' || session.status === 'BANNED'
                        ? 'red'
                        : 'gray'
                    }
                  >
                    {session.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage

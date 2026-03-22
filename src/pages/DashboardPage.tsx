import React from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useSessionStore } from '@/stores/session.store'
import { Card } from '@/components/common/Card'

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const sessions = useSessionStore((s) => s.sessions)

  const activeSessions = sessions.filter((s) => s.status === 'CONNECTED').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#e8ecf4]">
          Welcome back, {user?.username ?? 'User'}
        </h1>
        <p className="text-sm text-[#5a6478] mt-1">
          Here&apos;s an overview of your WhatsApp sessions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#22c55e]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#e8ecf4]">{sessions.length}</p>
              <p className="text-xs text-[#5a6478]">Total Sessions</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#e8ecf4]">{activeSessions}</p>
              <p className="text-xs text-[#5a6478]">Active Sessions</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#a855f7]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#e8ecf4]">{user?.maxSessions ?? 0}</p>
              <p className="text-xs text-[#5a6478]">Max Sessions</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage

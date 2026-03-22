import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/common/Card'
import { ContactLookup } from '@/components/contacts/ContactLookup'
import { BulkChecker } from '@/components/contacts/BulkChecker'
import apiClient from '@/services/api'
import type { Session } from '@/types'

interface SessionsResponse {
  sessions: Session[]
  total: number
}

export const ContactsPage: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState('')

  const { data } = useQuery({
    queryKey: ['sessions-list-contacts'],
    queryFn: async () => {
      const res = await apiClient.get<SessionsResponse>('/sessions', {
        params: { page: 1, limit: 100 },
      })
      return res.data
    },
  })

  const sessions = data?.sessions ?? []

  return (
    <div data-testid="contacts-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#e8ecf4]">Contacts</h1>
        <p className="text-sm text-[#5a6478] mt-1">
          Look up contacts and check WhatsApp availability
        </p>
      </div>

      {/* Session selector */}
      <div className="max-w-xs">
        <label className="text-sm font-medium text-[#8892a8] block mb-1">Session</label>
        <select
          value={selectedSessionId}
          onChange={(e) => setSelectedSessionId(e.target.value)}
          className="w-full bg-[#11141b] border border-[#252b3b] rounded-[10px] px-3 py-2 text-[#e8ecf4] text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
        >
          <option value="">Select a session...</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSessionId ? (
        <>
          {/* Single contact lookup */}
          <Card>
            <h2 className="text-sm font-semibold text-[#e8ecf4] mb-4">Single Contact Lookup</h2>
            <ContactLookup sessionId={selectedSessionId} />
          </Card>

          {/* Bulk checker */}
          <Card>
            <h2 className="text-sm font-semibold text-[#e8ecf4] mb-4">Bulk Contact Checker</h2>
            <BulkChecker sessionId={selectedSessionId} />
          </Card>
        </>
      ) : (
        <div className="text-center py-12 text-[#5a6478] text-sm">
          Select a session to look up contacts
        </div>
      )}
    </div>
  )
}

export default ContactsPage

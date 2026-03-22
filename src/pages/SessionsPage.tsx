import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { SessionList } from '@/components/sessions/SessionList'
import { CreateSessionModal } from '@/components/sessions/CreateSessionModal'
import { useUIStore } from '@/stores/ui.store'
import { useSessionStore } from '@/stores/session.store'
import apiClient from '@/services/api'
import type { Session } from '@/types'

interface SessionsResponse {
  sessions: Session[]
  total: number
  page: number
  limit: number
}

interface CreateSessionPayload {
  name: string
  description?: string
  connectionMethod: 'QR_CODE' | 'PAIRING_CODE'
  phoneNumber?: string
  webhookUrl?: string
}

export const SessionsPage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const LIMIT = 12

  const addToast = useUIStore((s) => s.addToast)
  const setSessions = useSessionStore((s) => s.setSessions)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', page, search],
    queryFn: async () => {
      const response = await apiClient.get<SessionsResponse>('/sessions', {
        params: { page, limit: LIMIT, search: search || undefined },
      })
      setSessions(response.data.sessions)
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateSessionPayload) =>
      apiClient.post<{ session: Session }>('/sessions', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })
      addToast({ type: 'success', title: 'Session created successfully' })
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to create session' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sessions/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })
      addToast({ type: 'success', title: 'Session deleted' })
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/sessions/${id}/disconnect`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })
      addToast({ type: 'info', title: 'Session disconnected' })
    },
  })

  const reconnectMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/sessions/${id}/reconnect`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })
      addToast({ type: 'info', title: 'Reconnecting session...' })
    },
  })

  const sessions = data?.sessions ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)

  const handleCreate = async (formData: CreateSessionPayload) => {
    await createMutation.mutateAsync(formData)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-[#e8ecf4]">Sessions</h1>
          <p className="text-sm text-[#5a6478] mt-1">
            {total} session{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Session
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* List */}
      <SessionList
        sessions={sessions}
        loading={isLoading}
        onDelete={(id) => deleteMutation.mutate(id)}
        onDisconnect={(id) => disconnectMutation.mutate(id)}
        onReconnect={(id) => reconnectMutation.mutate(id)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-[#8892a8]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <CreateSessionModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />
    </div>
  )
}

export default SessionsPage

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSessions } from '@/hooks/useSessions'
import { ApiKeyCard } from '@/components/apikeys/ApiKeyCard'
import { CreateApiKeyModal } from '@/components/apikeys/CreateApiKeyModal'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import apiClient from '@/services/api'
import type { ApiKey } from '@/types'

interface ApiKeysResponse {
  keys: ApiKey[]
}

export const ApiKeysPage: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: sessionsData, isLoading: sessionsLoading } = useSessions()
  const sessions = sessionsData?.sessions ?? []

  const {
    data: keysData,
    isLoading: keysLoading,
  } = useQuery({
    queryKey: ['apikeys', selectedSessionId],
    queryFn: async () => {
      const res = await apiClient.get<ApiKeysResponse>(`/sessions/${selectedSessionId}/keys`)
      return res.data
    },
    enabled: !!selectedSessionId,
  })

  const { mutate: revokeKey, isPending: revoking } = useMutation({
    mutationFn: (keyId: string) =>
      apiClient.delete(`/sessions/${selectedSessionId}/keys/${keyId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['apikeys', selectedSessionId] })
    },
  })

  const keys = keysData?.keys ?? []

  return (
    <div data-testid="apikeys-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#e8ecf4]">API Keys</h1>
        {selectedSessionId && (
          <Button onClick={() => setCreateModalOpen(true)}>
            + New API Key
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <label
            htmlFor="session-select"
            className="text-sm font-medium text-[#8892a8] flex-shrink-0"
          >
            Session:
          </label>
          {sessionsLoading ? (
            <p className="text-sm text-[#5a6478]">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-[#5a6478]">No sessions available</p>
          ) : (
            <select
              id="session-select"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-[#11141b] border border-[#252b3b] rounded-[10px] px-3 py-2 text-[#e8ecf4] text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
            >
              <option value="">Select a session...</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {!selectedSessionId && (
        <div className="text-center py-12 text-[#5a6478]">
          <p className="text-sm">Select a session to view its API keys</p>
        </div>
      )}

      {selectedSessionId && keysLoading && (
        <div className="text-center py-12 text-[#5a6478]">
          <p className="text-sm">Loading API keys...</p>
        </div>
      )}

      {selectedSessionId && !keysLoading && keys.length === 0 && (
        <div className="text-center py-12 text-[#5a6478]">
          <p className="text-sm">No API keys for this session yet</p>
        </div>
      )}

      {selectedSessionId && !keysLoading && keys.length > 0 && (
        <div className="flex flex-col gap-4">
          {keys.map((key) => (
            <ApiKeyCard
              key={key.id}
              apiKey={key}
              onRevoke={(id) => revokeKey(id)}
              revoking={revoking}
            />
          ))}
        </div>
      )}

      {selectedSessionId && (
        <CreateApiKeyModal
          open={createModalOpen}
          sessionId={selectedSessionId}
          onClose={() => {
            setCreateModalOpen(false)
            void queryClient.invalidateQueries({ queryKey: ['apikeys', selectedSessionId] })
          }}
        />
      )}
    </div>
  )
}

export default ApiKeysPage

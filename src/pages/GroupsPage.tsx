import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { GroupList } from '@/components/groups/GroupList'
import { CreateGroupModal } from '@/components/groups/CreateGroupModal'
import { MemberManager } from '@/components/groups/MemberManager'
import { Spinner } from '@/components/common/Spinner'
import { useUIStore } from '@/stores/ui.store'
import apiClient from '@/services/api'
import type { Session, Group } from '@/types'

interface SessionsResponse {
  sessions: Session[]
  total: number
}

export const GroupsPage: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  const { data: sessionsData } = useQuery({
    queryKey: ['sessions-list-groups'],
    queryFn: async () => {
      const res = await apiClient.get<SessionsResponse>('/sessions', {
        params: { page: 1, limit: 100 },
      })
      return res.data
    },
  })

  const {
    data: groupDetailData,
    isLoading: isGroupDetailLoading,
    refetch: refetchGroupDetail,
  } = useQuery({
    queryKey: ['group-detail', selectedSessionId, selectedGroup?.id],
    queryFn: async () => {
      const res = await apiClient.get<Group>(
        `/sessions/${selectedSessionId}/groups/${selectedGroup!.id}`
      )
      return res.data
    },
    enabled: !!selectedSessionId && !!selectedGroup,
  })

  const inviteLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.get<{ inviteCode: string; inviteLink: string }>(
        `/sessions/${selectedSessionId}/groups/${selectedGroup!.id}/invite-link`
      )
      return res.data
    },
    onSuccess: (data) => {
      void navigator.clipboard.writeText(data.inviteLink)
      addToast({ type: 'success', title: 'Invite link copied to clipboard' })
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to get invite link' })
    },
  })

  const leaveMutation = useMutation({
    mutationFn: async () =>
      apiClient.delete(`/sessions/${selectedSessionId}/groups/${selectedGroup!.id}/leave`),
    onSuccess: () => {
      addToast({ type: 'info', title: 'Left group' })
      setSelectedGroup(null)
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to leave group' })
    },
  })

  const sessions = sessionsData?.sessions ?? []
  const detail = groupDetailData

  return (
    <div data-testid="groups-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#e8ecf4]">Groups</h1>
        <p className="text-sm text-[#5a6478] mt-1">Manage your WhatsApp groups</p>
      </div>

      {/* Session selector */}
      <div className="max-w-xs">
        <label className="text-sm font-medium text-[#8892a8] block mb-1">Session</label>
        <select
          value={selectedSessionId}
          onChange={(e) => {
            setSelectedSessionId(e.target.value)
            setSelectedGroup(null)
          }}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel: Group list */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#e8ecf4]">Your Groups</h2>
              <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                New Group
              </Button>
            </div>
            <GroupList
              sessionId={selectedSessionId}
              onSelectGroup={(g) => setSelectedGroup(g)}
            />
          </Card>

          {/* Right panel: Group detail */}
          <div>
            {selectedGroup ? (
              <Card>
                {isGroupDetailLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-semibold text-[#e8ecf4]">
                          {detail?.subject ?? selectedGroup.subject}
                        </h2>
                        {(detail?.description ?? selectedGroup.description) && (
                          <p className="text-xs text-[#8892a8] mt-1">
                            {detail?.description ?? selectedGroup.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => inviteLinkMutation.mutate()}
                          loading={inviteLinkMutation.isPending}
                        >
                          Invite Link
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => leaveMutation.mutate()}
                          loading={leaveMutation.isPending}
                        >
                          Leave
                        </Button>
                      </div>
                    </div>

                    <MemberManager
                      sessionId={selectedSessionId}
                      groupId={selectedGroup.id}
                      participants={detail?.participants ?? []}
                      onRefresh={() => void refetchGroupDetail()}
                    />
                  </div>
                )}
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full min-h-48 text-[#5a6478] text-sm">
                Select a group to view details
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-[#5a6478] text-sm">
          Select a session to manage groups
        </div>
      )}

      <CreateGroupModal
        open={createModalOpen}
        sessionId={selectedSessionId}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(group) => {
          setSelectedGroup(group)
          setCreateModalOpen(false)
        }}
      />
    </div>
  )
}

export default GroupsPage

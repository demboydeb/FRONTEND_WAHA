import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/common/Button'
import { useUIStore } from '@/stores/ui.store'
import apiClient from '@/services/api'
import type { GroupParticipant } from '@/types'

interface MemberManagerProps {
  sessionId: string
  groupId: string
  participants: GroupParticipant[]
  onRefresh: () => void
}

export const MemberManager: React.FC<MemberManagerProps> = ({
  sessionId,
  groupId,
  participants,
  onRefresh,
}) => {
  const [addText, setAddText] = useState('')
  const addToast = useUIStore((s) => s.addToast)

  const participantsMutation = useMutation({
    mutationFn: (payload: { participants: string[]; action: 'add' | 'remove' }) =>
      apiClient.put(`/sessions/${sessionId}/groups/${groupId}/participants`, payload),
    onSuccess: (_, variables) => {
      addToast({
        type: 'success',
        title: variables.action === 'add' ? 'Members added' : 'Member removed',
      })
      onRefresh()
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to update members' })
    },
  })

  const adminsMutation = useMutation({
    mutationFn: (payload: { participants: string[]; action: 'promote' | 'demote' }) =>
      apiClient.put(`/sessions/${sessionId}/groups/${groupId}/admins`, payload),
    onSuccess: (_, variables) => {
      addToast({
        type: 'success',
        title: variables.action === 'promote' ? 'Promoted to admin' : 'Demoted from admin',
      })
      onRefresh()
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to update admin status' })
    },
  })

  const handleAddMembers = () => {
    const jids = addText
      .split('\n')
      .map((j) => j.trim())
      .filter((j) => j.length > 0)

    if (jids.length === 0) return

    participantsMutation.mutate({ participants: jids, action: 'add' })
    setAddText('')
  }

  const handleRemove = (jid: string) => {
    participantsMutation.mutate({ participants: [jid], action: 'remove' })
  }

  const handlePromote = (jid: string) => {
    adminsMutation.mutate({ participants: [jid], action: 'promote' })
  }

  const handleDemote = (jid: string) => {
    adminsMutation.mutate({ participants: [jid], action: 'demote' })
  }

  return (
    <div data-testid="member-manager" className="space-y-4">
      <h3 className="text-sm font-semibold text-[#e8ecf4]">Members ({participants.length})</h3>

      {/* Members list */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {participants.map((p) => (
          <div
            key={p.jid}
            data-testid="member-row"
            className="flex items-center justify-between gap-2 py-2 px-3 rounded-[8px] bg-[#0a0c10]"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs text-[#e8ecf4] font-mono truncate">{p.jid}</span>
              {p.isSuperAdmin && (
                <span className="text-xs bg-[#eab308]/10 text-[#eab308] px-1.5 py-0.5 rounded-full flex-shrink-0">
                  SuperAdmin
                </span>
              )}
              {p.isAdmin && !p.isSuperAdmin && (
                <span className="text-xs bg-[#22c55e]/10 text-[#22c55e] px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Admin
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {!p.isAdmin && !p.isSuperAdmin && (
                <button
                  onClick={() => handlePromote(p.jid)}
                  className="text-xs text-[#22c55e] hover:text-[#16a34a] px-2 py-1 rounded transition-colors"
                  title="Promote to Admin"
                >
                  Promote
                </button>
              )}
              {p.isAdmin && !p.isSuperAdmin && (
                <button
                  onClick={() => handleDemote(p.jid)}
                  className="text-xs text-[#eab308] hover:text-[#ca8a04] px-2 py-1 rounded transition-colors"
                  title="Demote from Admin"
                >
                  Demote
                </button>
              )}
              {!p.isSuperAdmin && (
                <button
                  onClick={() => handleRemove(p.jid)}
                  className="text-xs text-[#ef4444] hover:text-[#dc2626] px-2 py-1 rounded transition-colors"
                  title="Remove member"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <p className="text-xs text-[#5a6478] text-center py-4">No participants</p>
        )}
      </div>

      {/* Add members */}
      <div className="border-t border-[#252b3b] pt-4 space-y-2">
        <label className="text-xs font-medium text-[#8892a8]">Add Members (one JID per line)</label>
        <textarea
          value={addText}
          onChange={(e) => setAddText(e.target.value)}
          placeholder={'33612345678@s.whatsapp.net'}
          rows={3}
          className="w-full bg-[#11141b] border border-[#252b3b] rounded-[8px] px-3 py-2 text-[#e8ecf4] text-xs placeholder:text-[#5a6478] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 transition-colors resize-y"
        />
        <Button
          size="sm"
          onClick={handleAddMembers}
          loading={participantsMutation.isPending}
          disabled={!addText.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  )
}

export default MemberManager

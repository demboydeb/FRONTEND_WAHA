import React from 'react'
import { useGroups } from '@/hooks/useGroups'
import { GroupCard } from './GroupCard'
import { Spinner } from '@/components/common/Spinner'
import type { Group } from '@/types'
import type { AxiosError } from 'axios'

interface GroupListProps {
  sessionId: string
  onSelectGroup: (group: Group) => void
}

export const GroupList: React.FC<GroupListProps> = ({ sessionId, onSelectGroup }) => {
  const { data, isLoading, isError, error } = useGroups(sessionId)

  const groups = data?.groups ?? []

  const is503 = isError && (error as AxiosError)?.response?.status === 503
  const errorMsg = is503
    ? 'Session not connected — reconnect the session first.'
    : 'Failed to load groups. Please try again.'

  return (
    <div data-testid="group-list" className="space-y-2">
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className={`text-sm text-center py-4 rounded-[10px] px-3 ${is503 ? 'text-[#eab308] bg-[#eab308]/10 border border-[#eab308]/20' : 'text-[#ef4444]'}`}>
          {errorMsg}
        </div>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-[#5a6478]">No groups found</p>
        </div>
      )}

      {!isLoading && groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onClick={() => onSelectGroup(group)}
        />
      ))}
    </div>
  )
}

export default GroupList

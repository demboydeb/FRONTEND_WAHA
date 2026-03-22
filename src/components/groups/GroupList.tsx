import React from 'react'
import { useGroups } from '@/hooks/useGroups'
import { GroupCard } from './GroupCard'
import { Spinner } from '@/components/common/Spinner'
import type { Group } from '@/types'

interface GroupListProps {
  sessionId: string
  onSelectGroup: (group: Group) => void
}

export const GroupList: React.FC<GroupListProps> = ({ sessionId, onSelectGroup }) => {
  const { data, isLoading, isError } = useGroups(sessionId)

  const groups = data?.groups ?? []

  return (
    <div data-testid="group-list" className="space-y-2">
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {isError && (
        <p className="text-sm text-[#ef4444] text-center py-4">
          Failed to load groups. Please try again.
        </p>
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

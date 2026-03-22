import React from 'react'
import type { Group } from '@/types'

interface GroupCardProps {
  group: Group
  onClick?: () => void
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  return (
    <div
      data-testid="group-card"
      onClick={onClick}
      className={[
        'bg-[#161a24] border border-[#252b3b] rounded-[10px] p-4',
        onClick ? 'cursor-pointer hover:bg-[#1c2130] hover:border-[#3b4460] transition-colors' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            data-testid="group-subject"
            className="text-sm font-semibold text-[#e8ecf4] truncate"
          >
            {group.subject}
          </h3>

          {group.description && (
            <p className="text-xs text-[#8892a8] mt-1 line-clamp-2">{group.description}</p>
          )}

          {group.owner && (
            <p className="text-xs text-[#5a6478] mt-1 truncate">
              Owner: {group.owner}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 text-right">
          <div
            data-testid="group-participant-count"
            className="inline-flex items-center gap-1 text-xs text-[#8892a8] bg-[#0a0c10] rounded-full px-2 py-0.5"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {group.participantCount}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupCard

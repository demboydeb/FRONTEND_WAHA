import React, { useState } from 'react'
import { useCreateGroup } from '@/hooks/useGroups'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import type { Group } from '@/types'

interface CreateGroupModalProps {
  open: boolean
  sessionId: string
  onClose: () => void
  onCreated: (group: Group) => void
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  sessionId,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('')
  const [participantsText, setParticipantsText] = useState('')
  const [errors, setErrors] = useState<{ name?: string; participants?: string }>({})

  const createMutation = useCreateGroup(sessionId)

  if (!open) return null

  const validate = (): boolean => {
    const newErrors: { name?: string; participants?: string } = {}

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Group name must be at least 2 characters'
    }

    const participants = participantsText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    if (participants.length === 0) {
      newErrors.participants = 'At least one participant is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const participants = participantsText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    const result = await createMutation.mutateAsync({ name: name.trim(), participants })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onCreated(result.data as any)
    setName('')
    setParticipantsText('')
    setErrors({})
    onClose()
  }

  const handleClose = () => {
    setName('')
    setParticipantsText('')
    setErrors({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div
        data-testid="create-group-modal"
        className="relative bg-[#161a24] border border-[#252b3b] rounded-[12px] p-6 w-full max-w-md mx-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#e8ecf4]">Create New Group</h2>
          <button
            onClick={handleClose}
            className="text-[#5a6478] hover:text-[#e8ecf4] transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Group Name"
            placeholder="My Group"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="create-group-participants" className="text-sm font-medium text-[#8892a8]">
              Participants (one JID per line)
            </label>
            <textarea
              id="create-group-participants"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              placeholder={'33612345678@s.whatsapp.net\n447911123456@s.whatsapp.net'}
              rows={4}
              className={[
                'bg-[#11141b] border rounded-[10px] px-3 py-2 text-[#e8ecf4] text-sm placeholder:text-[#5a6478]',
                'focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 transition-colors resize-y',
                errors.participants
                  ? 'border-[#ef4444] focus:ring-[#ef4444]/50'
                  : 'border-[#252b3b] focus:border-[#3b4460]',
              ].join(' ')}
            />
            {errors.participants && (
              <p className="text-xs text-[#ef4444]">{errors.participants}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            loading={createMutation.isPending}
            className="flex-1"
          >
            Create Group
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-xs text-[#ef4444] mt-2">Failed to create group. Please try again.</p>
        )}
      </div>
    </div>
  )
}

export default CreateGroupModal

import React from 'react'
import type { MessageType } from '@/types'

interface MessageTypePickerProps {
  value: MessageType
  onChange: (type: MessageType) => void
}

const MESSAGE_TYPES: { type: MessageType; icon: string; label: string }[] = [
  { type: 'text', icon: '📝', label: 'Text' },
  { type: 'image', icon: '🖼️', label: 'Image' },
  { type: 'video', icon: '🎬', label: 'Video' },
  { type: 'audio', icon: '🎵', label: 'Audio' },
  { type: 'document', icon: '📄', label: 'Document' },
  { type: 'location', icon: '📍', label: 'Location' },
  { type: 'sticker', icon: '😀', label: 'Sticker' },
  { type: 'contact', icon: '👤', label: 'Contact' },
  { type: 'buttons', icon: '🔘', label: 'Buttons' },
  { type: 'list', icon: '📋', label: 'List' },
  { type: 'template', icon: '📐', label: 'Template' },
  { type: 'poll', icon: '📊', label: 'Poll' },
  { type: 'reaction', icon: '👍', label: 'Reaction' },
  { type: 'reply', icon: '↩️', label: 'Reply' },
  { type: 'forward', icon: '↪️', label: 'Forward' },
]

export const MessageTypePicker: React.FC<MessageTypePickerProps> = ({ value, onChange }) => {
  return (
    <div
      data-testid="message-type-picker"
      className="grid grid-cols-4 gap-2"
    >
      {MESSAGE_TYPES.map(({ type, icon, label }) => (
        <button
          key={type}
          data-testid={`msg-type-${type}`}
          type="button"
          onClick={() => onChange(type)}
          className={[
            'flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-colors',
            value === type
              ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
              : 'border-[#252b3b] text-[#e8ecf4] hover:border-[#3b4460]',
          ].join(' ')}
        >
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  )
}

export default MessageTypePicker

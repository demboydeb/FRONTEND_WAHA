import React from 'react'

type BadgeVariant = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'cyan' | 'yellow' | 'gray'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30',
  blue: 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30',
  purple: 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30',
  orange: 'bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30',
  red: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
  cyan: 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30',
  yellow: 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30',
  gray: 'bg-[#5a6478]/20 text-[#8892a8] border-[#5a6478]/30',
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children, className = '' }) => {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export default Badge

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={[
        'bg-[#161a24] border border-[#252b3b] rounded-[10px] p-4',
        onClick ? 'cursor-pointer hover:bg-[#1c2130] transition-colors' : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card

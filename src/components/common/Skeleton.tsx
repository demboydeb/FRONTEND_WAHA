import React from 'react'

interface SkeletonProps {
  className?: string
  lines?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1 }) => {
  if (lines > 1) {
    return (
      <div data-testid="skeleton" className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={[
              'animate-pulse bg-[#252b3b] rounded-[6px] h-4',
              className,
            ].join(' ')}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      data-testid="skeleton"
      className={[
        'animate-pulse bg-[#252b3b] rounded-[6px] h-4',
        className,
      ].join(' ')}
    />
  )
}

export default Skeleton

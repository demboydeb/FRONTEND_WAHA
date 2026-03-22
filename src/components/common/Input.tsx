import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#8892a8]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'bg-[#11141b] border rounded-[10px] px-3 py-2 text-[#e8ecf4] text-sm',
            'placeholder:text-[#5a6478]',
            'focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50',
            'transition-colors duration-150',
            error
              ? 'border-[#ef4444] focus:ring-[#ef4444]/50'
              : 'border-[#252b3b] focus:border-[#3b4460]',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#5a6478]">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input

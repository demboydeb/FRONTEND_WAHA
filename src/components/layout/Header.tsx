import React from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'

interface HeaderProps {
  title?: string
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const user = useAuthStore((s) => s.user)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#252b3b] bg-[#11141b]">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-[#5a6478] hover:text-[#e8ecf4] transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {title && <h1 className="text-base font-semibold text-[#e8ecf4]">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-[#22c55e]">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-[#8892a8] hidden sm:block">{user.username}</span>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

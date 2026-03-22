import React from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

interface HeaderProps {
  title?: string
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const user = useAuthStore((s) => s.user)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

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
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-[#5a6478] hover:text-[#e8ecf4] transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          data-testid="theme-toggle"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
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

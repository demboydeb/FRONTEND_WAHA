import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from '@/components/common/Toast'

interface LayoutProps {
  title?: string
}

export const Layout: React.FC<LayoutProps> = ({ title }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0c10]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Layout

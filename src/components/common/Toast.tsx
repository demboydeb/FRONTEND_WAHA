import React, { useEffect } from 'react'
import type { Toast as ToastType } from '@/types'
import { useUIStore } from '@/stores/ui.store'

interface ToastItemProps {
  toast: ToastType
}

const icons: Record<ToastType['type'], React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const removeToast = useUIStore((s) => s.removeToast)
  const duration = toast.duration ?? 4000

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), duration)
    return () => clearTimeout(timer)
  }, [toast.id, duration, removeToast])

  return (
    <div
      role="alert"
      className="flex items-start gap-3 bg-[#161a24] border border-[#252b3b] rounded-[10px] p-4 shadow-xl min-w-[280px] max-w-sm"
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e8ecf4]">{toast.title}</p>
        {toast.message && <p className="text-xs text-[#8892a8] mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-[#5a6478] hover:text-[#e8ecf4]"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts)

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default ToastContainer

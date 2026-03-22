import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { socketService } from '@/services/socket'
import apiClient from '@/services/api'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const logout = useAuthStore((s) => s.logout)
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const addToast = useUIStore((s) => s.addToast)

  const [loggingOut, setLoggingOut] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) })

  const handleChangePassword = async (values: PasswordFormValues) => {
    setChangingPassword(true)
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      addToast({ type: 'success', title: 'Password changed successfully' })
      reset()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      addToast({
        type: 'error',
        title: 'Failed to change password',
        message: axiosError.response?.data?.message ?? 'An error occurred',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken })
      }
    } catch {
      // ignore logout errors
    } finally {
      socketService.disconnect()
      logout()
      navigate('/login')
    }
  }

  return (
    <div data-testid="settings-page">
      <h1 className="text-2xl font-semibold text-[#e8ecf4] mb-6">Settings</h1>

      {/* User Info */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-[#e8ecf4] mb-4">Account</h2>
        {user ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex gap-2">
              <span className="text-[#5a6478] w-24">Username:</span>
              <span className="text-[#e8ecf4]">{user.username}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#5a6478] w-24">Email:</span>
              <span className="text-[#e8ecf4]">{user.email}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#5a6478] w-24">Role:</span>
              <span className="text-[#e8ecf4]">{user.role}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#5a6478]">Not logged in</p>
        )}
      </Card>

      {/* Change Password */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-[#e8ecf4] mb-4">Change Password</h2>
        <form
          data-testid="change-password-form"
          onSubmit={handleSubmit(handleChangePassword)}
          className="flex flex-col gap-4 max-w-sm"
        >
          <Input
            label="Current Password"
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            error={errors.confirmNewPassword?.message}
            {...register('confirmNewPassword')}
          />
          <div>
            <Button type="submit" loading={changingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-[#e8ecf4] mb-4">Preferences</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#8892a8]">Theme:</span>
          <button
            data-testid="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 bg-[#11141b] border border-[#252b3b] rounded-[10px] px-3 py-2 text-sm text-[#e8ecf4] hover:border-[#3b4460] transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card>
        <h2 className="text-base font-semibold text-[#ef4444] mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#e8ecf4]">Logout</p>
            <p className="text-xs text-[#5a6478]">Sign out of your account and disconnect</p>
          </div>
          <Button
            variant="danger"
            data-testid="logout-btn"
            onClick={handleLogout}
            loading={loggingOut}
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default SettingsPage

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/services/api'
import { useSessionStore } from '@/stores/session.store'
import type { Session } from '@/types'

interface SessionsResponse {
  sessions: Session[]
  total: number
  page: number
  limit: number
}

export const useSessions = (params?: { page?: number; limit?: number; search?: string }) => {
  const setSessions = useSessionStore((s) => s.setSessions)

  return useQuery({
    queryKey: ['sessions', params],
    queryFn: async () => {
      const response = await apiClient.get<SessionsResponse>('/sessions', { params })
      setSessions(response.data.sessions)
      return response.data
    },
  })
}

export const useSession = (id: string) => {
  const setCurrentSession = useSessionStore((s) => s.setCurrentSession)

  return useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const response = await apiClient.get<{ session: Session }>(`/sessions/${id}`)
      setCurrentSession(response.data.session)
      return response.data.session
    },
    enabled: !!id,
  })
}

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      connectionMethod: 'QR_CODE' | 'PAIRING_CODE'
      phoneNumber?: string
      webhookUrl?: string
    }) => apiClient.post<{ session: Session }>('/sessions', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sessions/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

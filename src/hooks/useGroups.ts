import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/services/api'
import type { Group } from '@/types'

export const useGroups = (sessionId: string) => {
  return useQuery({
    queryKey: ['groups', sessionId],
    queryFn: async () => {
      const response = await apiClient.get<{ total: number; groups: Group[] }>(`/sessions/${sessionId}/groups`)
      return response.data
    },
    enabled: !!sessionId,
  })
}

export const useCreateGroup = (sessionId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; participants: string[] }) =>
      apiClient.post(`/sessions/${sessionId}/groups`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups', sessionId] })
    },
  })
}

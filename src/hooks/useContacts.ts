import { useMutation } from '@tanstack/react-query'
import apiClient from '@/services/api'
import type { ContactCheck } from '@/types'

export const useCheckContact = (sessionId: string) => {
  return useMutation({
    mutationFn: (phone: string) =>
      apiClient.get<ContactCheck>(`/sessions/${sessionId}/contacts/${phone}/exists`),
  })
}

export const useBulkCheckContacts = (sessionId: string) => {
  return useMutation({
    mutationFn: (phones: string[]) =>
      apiClient.post<{ total: number; found: number; results: ContactCheck[] }>(
        `/sessions/${sessionId}/contacts/check-bulk`,
        { phones }
      ),
  })
}

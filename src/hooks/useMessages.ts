import { useMutation } from '@tanstack/react-query'
import apiClient from '@/services/api'
import type { MessageType } from '@/types'

interface SendMessagePayload {
  to: string
  type: MessageType
  content?: string
  caption?: string
  [key: string]: unknown
}

interface SendMessageResponse {
  message: string
  messageId: string
  type: string
  to: string
}

export const useSendMessage = (sessionId: string) => {
  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      apiClient.post<SendMessageResponse>(`/sessions/${sessionId}/messages/send`, payload),
  })
}

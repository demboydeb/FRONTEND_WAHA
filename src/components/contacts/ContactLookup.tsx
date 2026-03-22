import React, { useState } from 'react'
import { useCheckContact } from '@/hooks/useContacts'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import apiClient from '@/services/api'

interface ContactLookupProps {
  sessionId: string
}

interface ContactPicture {
  phone: string
  jid: string
  pictureUrl: string
  quality: string
}

interface ContactStatus {
  phone: string
  jid: string
  status: string
  setAt: string
}

export const ContactLookup: React.FC<ContactLookupProps> = ({ sessionId }) => {
  const [phone, setPhone] = useState('')
  const [pictureUrl, setPictureUrl] = useState<string | null>(null)
  const [statusText, setStatusText] = useState<string | null>(null)

  const checkMutation = useCheckContact(sessionId)

  const handleCheck = async () => {
    if (!phone.trim()) return
    setPictureUrl(null)
    setStatusText(null)

    const result = await checkMutation.mutateAsync(phone.trim())
    const data = result.data

    if (data.exists) {
      try {
        const picRes = await apiClient.get<ContactPicture>(
          `/sessions/${sessionId}/contacts/${phone.trim()}/picture`
        )
        setPictureUrl(picRes.data.pictureUrl)
      } catch {
        // picture not available
      }

      try {
        const statusRes = await apiClient.get<ContactStatus>(
          `/sessions/${sessionId}/contacts/${phone.trim()}/status`
        )
        setStatusText(statusRes.data.status)
      } catch {
        // status not available
      }
    }
  }

  const result = checkMutation.data?.data
  const isLoading = checkMutation.isPending

  return (
    <div data-testid="contact-lookup" className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            data-testid="lookup-input"
            placeholder="+33612345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            label="Phone Number"
            helperText="Format: +33612345678"
            onKeyDown={(e) => { if (e.key === 'Enter') void handleCheck() }}
          />
        </div>
        <Button
          onClick={() => void handleCheck()}
          loading={isLoading}
          disabled={!phone.trim()}
        >
          Check
        </Button>
      </div>

      {result && (
        <div data-testid="lookup-result" className="p-4 rounded-[10px] bg-[#0a0c10] border border-[#252b3b]">
          {result.exists ? (
            <div data-testid="lookup-exists" className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1c2130] flex-shrink-0">
                {pictureUrl ? (
                  <img src={pictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#5a6478]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-[#22c55e]">Exists on WhatsApp</span>
                </div>
                <p className="text-xs text-[#5a6478]">JID: {result.jid}</p>
                {statusText && (
                  <p className="text-xs text-[#8892a8] mt-1">Status: {statusText}</p>
                )}
              </div>
            </div>
          ) : (
            <div data-testid="lookup-not-found" className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium text-[#ef4444]">Not on WhatsApp</span>
            </div>
          )}
        </div>
      )}

      {checkMutation.isError && (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (checkMutation.error as any)?.response?.status
        return (
          <div className={`text-sm p-3 rounded-[10px] ${status === 503 ? 'text-[#eab308] bg-[#eab308]/10 border border-[#eab308]/20' : 'text-[#ef4444]'}`}>
            {status === 503
              ? 'Session not connected — reconnect the session first.'
              : 'Error checking contact. Please try again.'}
          </div>
        )
      })()}
    </div>
  )
}

export default ContactLookup

import React, { useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { ApiKey } from '@/types'

interface ApiKeyCardProps {
  apiKey: ApiKey
  rawKey?: string
  onRevoke: (id: string) => void
  revoking?: boolean
}

const statusVariant: Record<ApiKey['status'], 'green' | 'gray' | 'red'> = {
  ACTIVE: 'green',
  REVOKED: 'gray',
  EXPIRED: 'red',
}

export const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  apiKey,
  rawKey,
  onRevoke,
  revoking = false,
}) => {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const displayKey = (): string => {
    if (rawKey) {
      if (revealed) return rawKey
      const first4 = rawKey.slice(0, 5)
      const last4 = rawKey.slice(-4)
      return `${first4}****...****${last4}`
    }
    return apiKey.keyPrefix
  }

  const handleCopy = async () => {
    const value = rawKey ?? apiKey.keyPrefix
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmRevoke = () => {
    onRevoke(apiKey.id)
    setShowConfirm(false)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <>
      <div
        data-testid="apikey-card"
        className="bg-[#161a24] border border-[#252b3b] rounded-[10px] p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-[#e8ecf4] truncate">{apiKey.name}</h3>
              <Badge variant={statusVariant[apiKey.status]}>{apiKey.status}</Badge>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <code className="text-xs text-[#8892a8] font-mono bg-[#11141b] px-2 py-1 rounded border border-[#252b3b]">
                {displayKey()}
              </code>
              {rawKey && (
                <button
                  data-testid="reveal-btn"
                  onClick={() => setRevealed((v) => !v)}
                  className="text-[#5a6478] hover:text-[#e8ecf4] transition-colors"
                  aria-label={revealed ? 'Hide key' : 'Reveal key'}
                >
                  {revealed ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              )}
              <button
                data-testid="copy-btn"
                onClick={handleCopy}
                className="text-[#5a6478] hover:text-[#e8ecf4] transition-colors text-xs"
                aria-label="Copy key"
              >
                {copied ? (
                  <span className="text-[#22c55e]">Copied!</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {apiKey.canSendMessages && (
                <Badge variant="blue">Send Messages</Badge>
              )}
              {apiKey.canReadMessages && (
                <Badge variant="purple">Read Messages</Badge>
              )}
            </div>

            <div className="flex gap-4 text-xs text-[#5a6478]">
              <span>Used: {apiKey.usageCount} times</span>
              <span>Last used: {formatDate(apiKey.lastUsedAt)}</span>
              {apiKey.expiresAt && (
                <span>Expires: {formatDate(apiKey.expiresAt)}</span>
              )}
            </div>
          </div>

          {apiKey.status === 'ACTIVE' && (
            <Button
              variant="ghost"
              size="sm"
              data-testid="revoke-btn"
              onClick={() => setShowConfirm(true)}
              disabled={revoking}
              className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10 flex-shrink-0"
            >
              Revoke
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${apiKey.name}"? This action cannot be undone.`}
        confirmLabel="Revoke"
        variant="danger"
        onConfirm={handleConfirmRevoke}
        onCancel={() => setShowConfirm(false)}
        loading={revoking}
      />
    </>
  )
}

export default ApiKeyCard

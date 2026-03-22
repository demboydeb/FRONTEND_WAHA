import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Spinner } from '@/components/common/Spinner'

interface QRCodeViewerProps {
  qrData: string | null
  expiresAt?: string | null
  sessionId: string
  onExpired?: () => void
}

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
  qrData,
  expiresAt,
  sessionId: _sessionId,
  onExpired,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(null)
      return
    }
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
      if (diff === 0) onExpired?.()
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  if (!qrData) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 bg-[#11141b] rounded-[10px] border border-[#252b3b]">
        <Spinner size="lg" />
        <p className="text-sm text-[#5a6478]">Waiting for QR code...</p>
      </div>
    )
  }

  const isExpired = secondsLeft === 0

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-[#11141b] rounded-[10px] border border-[#252b3b]">
      <div className="relative">
        <div
          className={[
            'p-4 bg-white rounded-[10px] transition-opacity',
            isExpired ? 'opacity-30' : '',
          ].join(' ')}
          data-testid="qr-code-container"
        >
          <QRCodeSVG value={qrData} size={200} />
        </div>
        {isExpired && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-semibold text-[#ef4444] bg-[#0a0c10]/80 px-3 py-1 rounded">
              Expired
            </p>
          </div>
        )}
      </div>

      {secondsLeft !== null && !isExpired && (
        <div className="flex items-center gap-2">
          <div
            className={[
              'h-2 w-2 rounded-full',
              secondsLeft > 30 ? 'bg-[#22c55e]' : 'bg-[#f97316] animate-pulse',
            ].join(' ')}
          />
          <p className="text-sm text-[#8892a8]">
            Expires in <span className="font-mono text-[#e8ecf4]">{secondsLeft}s</span>
          </p>
        </div>
      )}

      <p className="text-xs text-[#5a6478] text-center">
        Scan this QR code with WhatsApp to connect
      </p>
    </div>
  )
}

export default QRCodeViewer

import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { QRCodeViewer } from '@/components/qr/QRCodeViewer'
import { PairingCodeInput } from '@/components/qr/PairingCodeInput'
import { EventConfigPanel } from '@/components/events/EventConfigPanel'
import { SendMessageForm } from '@/components/messages/SendMessageForm'
import { ActivityFeed } from '@/components/events/ActivityFeed'
import { useUIStore } from '@/stores/ui.store'
import { useSessionStore } from '@/stores/session.store'
import { useSessionSocket } from '@/hooks/useSocket'
import type { SessionStatus } from '@/types'
import apiClient from '@/services/api'
import type { Session } from '@/types'

type TabId = 'overview' | 'events' | 'messages' | 'activity'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'events', label: 'Events' },
  { id: 'messages', label: 'Messages' },
  { id: 'activity', label: 'Activity' },
]

export const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addToast = useUIStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabId>('overview')

  // Live status: prefer socket-updated store value, fall back to query data
  const storeStatus = useSessionStore(
    (s) => s.sessions.find((sess) => sess.id === id)?.status ?? s.currentSession?.status
  )
  const setCurrentSession = useSessionStore((s) => s.setCurrentSession)

  const [qrData, setQrData] = useState<string | null>(null)
  const [qrExpiresAt, setQrExpiresAt] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [pairingLoading, setPairingLoading] = useState(false)

  const socket = useSessionSocket(id ?? '')

  // Listen for QR updates
  React.useEffect(() => {
    const handleQr = (data: { sessionId: string; qr: string; expiresAt: string }) => {
      if (data.sessionId === id) {
        setQrData(data.qr)
        setQrExpiresAt(data.expiresAt)
      }
    }
    const handlePairingCode = (data: { sessionId: string; code: string }) => {
      if (data.sessionId === id) {
        setPairingCode(data.code)
        setPairingLoading(false)
      }
    }
    socket.on('session:qr', handleQr)
    socket.on('session:pairing_code', handlePairingCode)
    return () => {
      socket.off('session:qr', handleQr)
      socket.off('session:pairing_code', handlePairingCode)
    }
  }, [socket, id])

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const response = await apiClient.get<{ session: Session }>(`/sessions/${id}`)
      return response.data.session
    },
    enabled: !!id,
    refetchInterval: 5000,
  })

  // Sync query data → store so storeStatus is always populated on direct navigation.
  React.useEffect(() => {
    if (session) setCurrentSession(session)
  }, [session, setCurrentSession])

  const disconnectMutation = useMutation({
    mutationFn: () => apiClient.post(`/sessions/${id}/disconnect`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['session', id] })
      addToast({ type: 'info', title: 'Session disconnected' })
    },
  })

  const reconnectMutation = useMutation({
    mutationFn: () => apiClient.post(`/sessions/${id}/reconnect`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['session', id] })
      addToast({ type: 'info', title: 'Reconnecting...' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/sessions/${id}`),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Session deleted' })
      navigate('/sessions')
    },
  })

  const handleRequestPairingCode = useCallback(async (phoneNumber: string) => {
    setPairingLoading(true)
    try {
      await apiClient.post(`/sessions/${id}/reconnect`, { phoneNumber })
    } catch {
      setPairingLoading(false)
      addToast({ type: 'error', title: 'Failed to request pairing code' })
    }
  }, [id, addToast])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  // effectiveStatus: socket-updated value wins over stale query data
  const effectiveStatus: SessionStatus = storeStatus ?? session?.status ?? 'INITIALIZING'

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444]">Session not found</p>
        <Button className="mt-4" variant="ghost" onClick={() => navigate('/sessions')}>
          Back to Sessions
        </Button>
      </div>
    )
  }

  const statusVariant = {
    CONNECTED: 'green',
    DISCONNECTED: 'gray',
    ERROR: 'red',
    BANNED: 'red',
    INITIALIZING: 'blue',
    QR_PENDING: 'cyan',
    PAIRING: 'purple',
    RECONNECTING: 'orange',
  } as const

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back + header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')}>
          ← Back
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[#e8ecf4]">{session.name}</h1>
          <Badge variant={statusVariant[effectiveStatus]}>{effectiveStatus}</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#252b3b]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-[#22c55e] text-[#22c55e]'
                : 'border-transparent text-[#5a6478] hover:text-[#e8ecf4]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session info */}
          <Card>
            <h2 className="text-sm font-semibold text-[#e8ecf4] mb-4">Session Info</h2>
            <div className="flex flex-col gap-2 text-sm">
              {[
                ['ID', session.id],
                ['Phone', session.phoneNumber ?? '—'],
                ['Method', session.connectionMethod],
                ['Webhook', session.webhookUrl ?? '—'],
                ['Created', new Date(session.createdAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[#5a6478]">{k}</span>
                  <span className="text-[#e8ecf4] font-mono text-xs truncate max-w-[200px]">{v}</span>
                </div>
              ))}
            </div>

            {/* Anti-Ban link */}
            <div className="mt-4 pt-4 border-t border-[#252b3b]">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/sessions/${id}/antiban`)}
              >
                Anti-Ban Dashboard →
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-[#252b3b]">
              {effectiveStatus === 'CONNECTED' && (
                <Button
                  size="sm"
                  variant="outline"
                  loading={disconnectMutation.isPending}
                  onClick={() => disconnectMutation.mutate()}
                >
                  Disconnect
                </Button>
              )}
              {(effectiveStatus === 'DISCONNECTED' || effectiveStatus === 'ERROR') && (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={reconnectMutation.isPending}
                  onClick={() => reconnectMutation.mutate()}
                >
                  Reconnect
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </Button>
            </div>
          </Card>

          {/* QR / Pairing — effectiveStatus reacts instantly to socket events */}
          {effectiveStatus !== 'CONNECTED' &&
            (effectiveStatus === 'QR_PENDING' || effectiveStatus === 'INITIALIZING') && (
            <div>
              {session.connectionMethod === 'QR_CODE' ? (
                <QRCodeViewer
                  qrData={qrData}
                  expiresAt={qrExpiresAt}
                  sessionId={session.id}
                />
              ) : (
                <PairingCodeInput
                  pairingCode={pairingCode}
                  loading={pairingLoading}
                  onRequestCode={handleRequestPairingCode}
                />
              )}
            </div>
          )}

          {effectiveStatus === 'CONNECTED' && (
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
                <p className="text-sm font-semibold text-[#22c55e]">Connected</p>
              </div>
              <p className="text-sm text-[#8892a8]">
                WhatsApp is active on{' '}
                <span className="text-[#e8ecf4] font-mono">{session.phoneNumber}</span>
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <EventConfigPanel sessionId={session.id} />
      )}

      {activeTab === 'messages' && (
        <Card>
          <h2 className="text-sm font-semibold text-[#e8ecf4] mb-4">Send Message</h2>
          {effectiveStatus === 'CONNECTED' ? (
            <SendMessageForm
              sessionId={session.id}
              onSuccess={() => addToast({ type: 'success', title: 'Message sent' })}
            />
          ) : (
            <p className="text-sm text-[#5a6478]">
              Session must be connected to send messages. Current status: {effectiveStatus}
            </p>
          )}
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <h2 className="text-sm font-semibold text-[#e8ecf4] mb-4">Activity Feed</h2>
          <ActivityFeed sessionId={session.id} />
        </Card>
      )}
    </div>
  )
}

export default SessionDetailPage

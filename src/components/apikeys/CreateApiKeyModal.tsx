import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import apiClient from '@/services/api'

interface CreateApiKeyModalProps {
  open: boolean
  sessionId: string
  onClose: () => void
}

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type FormValues = z.infer<typeof schema>

interface CreateApiKeyResponse {
  message: string
  rawKey: string
  apiKey: {
    id: string
    name: string
    keyPrefix: string
  }
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  open,
  sessionId,
  onClose,
}) => {
  const [phase, setPhase] = useState<'form' | 'success'>('form')
  const [rawKey, setRawKey] = useState('')
  const [rawKeyCopied, setRawKeyCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const handleClose = () => {
    reset()
    setPhase('form')
    setRawKey('')
    setError(null)
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await apiClient.post<CreateApiKeyResponse>(
        `/sessions/${sessionId}/keys`,
        { name: values.name }
      )
      setRawKey(res.data.rawKey)
      setPhase('success')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message ?? 'Failed to create API key')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyRawKey = async () => {
    await navigator.clipboard.writeText(rawKey)
    setRawKeyCopied(true)
    setTimeout(() => setRawKeyCopied(false), 2000)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={phase === 'form' ? 'Create API Key' : 'API Key Created'}
      size="md"
      data-testid="create-apikey-modal"
    >
      <div data-testid="create-apikey-modal">
        {phase === 'form' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Key Name"
              placeholder="e.g. Production Key"
              data-testid="apikey-name-input"
              error={errors.name?.message}
              {...register('name')}
            />
            {error && (
              <p className="text-xs text-[#ef4444]">{error}</p>
            )}
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="ghost" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create Key
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-[#eab308]/10 border border-[#eab308]/30 rounded-[10px] p-3">
              <p className="text-xs text-[#eab308] font-medium">
                Save this key — it will never be shown again
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                data-testid="raw-key-display"
                readOnly
                value={rawKey}
                className="flex-1 bg-[#11141b] border border-[#252b3b] rounded-[10px] px-3 py-2 text-[#e8ecf4] text-sm font-mono"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyRawKey}
                data-testid="copy-raw-key-btn"
              >
                {rawKeyCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="flex justify-end mt-2">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default CreateApiKeyModal

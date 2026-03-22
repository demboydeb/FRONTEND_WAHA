import React from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm" data-testid="confirm-modal">
      <div data-testid="confirm-modal">
        <p className="text-sm text-[#8892a8] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            data-testid="cancel-btn"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            data-testid="confirm-btn"
            className={variant === 'warning' ? 'bg-[#eab308] hover:bg-[#ca8a04] text-white' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal

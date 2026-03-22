import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

const createSessionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  connectionMethod: z.enum(['QR_CODE', 'PAIRING_CODE']),
  phoneNumber: z.string().optional(),
  webhookUrl: z.string().url('Invalid webhook URL').optional().or(z.literal('')),
})

type CreateSessionForm = z.infer<typeof createSessionSchema>

interface CreateSessionModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateSessionForm) => Promise<void>
  loading?: boolean
}

const STEPS = ['Details', 'Connection', 'Confirm'] as const

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [step, setStep] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: { connectionMethod: 'QR_CODE' },
  })

  const formValues = watch()

  const handleClose = () => {
    reset()
    setStep(0)
    onClose()
  }

  const nextStep = async () => {
    const fieldsToValidate: (keyof CreateSessionForm)[] =
      step === 0 ? ['name'] : step === 1 ? ['connectionMethod'] : []
    const valid = await trigger(fieldsToValidate)
    if (valid) setStep((s) => s + 1)
  }

  const handleFormSubmit = async (data: CreateSessionForm) => {
    await onSubmit(data)
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Session" size="md">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  'h-6 w-6 rounded-full text-xs font-semibold flex items-center justify-center',
                  i <= step
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-[#252b3b] text-[#5a6478]',
                ].join(' ')}
              >
                {i + 1}
              </div>
              <span className={['text-xs', i <= step ? 'text-[#e8ecf4]' : 'text-[#5a6478]'].join(' ')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={['flex-1 h-px', i < step ? 'bg-[#22c55e]' : 'bg-[#252b3b]'].join(' ')} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <Input
              label="Session Name"
              placeholder="My WhatsApp Session"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Description (optional)"
              placeholder="Business account..."
              {...register('description')}
            />
            <Input
              label="Webhook URL (optional)"
              type="url"
              placeholder="https://..."
              error={errors.webhookUrl?.message}
              {...register('webhookUrl')}
            />
          </div>
        )}

        {/* Step 1 — Connection method */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[#8892a8] mb-1">Choose connection method</p>
            {(['QR_CODE', 'PAIRING_CODE'] as const).map((method) => (
              <label
                key={method}
                className={[
                  'flex items-center gap-3 p-4 rounded-[10px] border cursor-pointer transition-colors',
                  formValues.connectionMethod === method
                    ? 'border-[#22c55e] bg-[#22c55e]/5'
                    : 'border-[#252b3b] hover:border-[#3b4460]',
                ].join(' ')}
              >
                <input
                  type="radio"
                  value={method}
                  className="accent-[#22c55e]"
                  {...register('connectionMethod')}
                />
                <div>
                  <p className="text-sm font-medium text-[#e8ecf4]">
                    {method === 'QR_CODE' ? 'QR Code' : 'Pairing Code'}
                  </p>
                  <p className="text-xs text-[#5a6478]">
                    {method === 'QR_CODE'
                      ? 'Scan a QR code with WhatsApp'
                      : 'Use a phone number + 8-digit code'}
                  </p>
                </div>
              </label>
            ))}
            {formValues.connectionMethod === 'PAIRING_CODE' && (
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+33612345678"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber')}
              />
            )}
          </div>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[#8892a8] mb-1">Review before creating</p>
            <div className="bg-[#11141b] rounded-[10px] border border-[#252b3b] divide-y divide-[#252b3b]">
              {[
                ['Name', formValues.name],
                ['Method', formValues.connectionMethod === 'QR_CODE' ? 'QR Code' : 'Pairing Code'],
                formValues.description ? ['Description', formValues.description] : null,
                formValues.webhookUrl ? ['Webhook', formValues.webhookUrl] : null,
              ]
                .filter((x): x is string[] => x !== null)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2 text-sm">
                    <span className="text-[#5a6478]">{k}</span>
                    <span className="text-[#e8ecf4] font-medium truncate max-w-[180px]">{v}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6 gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < 2 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" loading={loading}>
              Create Session
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default CreateSessionModal

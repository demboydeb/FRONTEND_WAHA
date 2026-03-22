import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

// Accepts international phone numbers: +1234567890 or 1234567890 (7-15 digits)
const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid phone number (e.g. +33612345678)'),
})

type PhoneForm = z.infer<typeof phoneSchema>

interface PairingCodeInputProps {
  pairingCode: string | null
  loading?: boolean
  onRequestCode: (phoneNumber: string) => void
}

export const PairingCodeInput: React.FC<PairingCodeInputProps> = ({
  pairingCode,
  loading = false,
  onRequestCode,
}) => {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) })

  const onSubmit = (data: PhoneForm) => {
    setSubmitted(true)
    onRequestCode(data.phoneNumber)
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#11141b] rounded-[10px] border border-[#252b3b]">
      <div>
        <h3 className="text-sm font-semibold text-[#e8ecf4] mb-1">Pairing Code</h3>
        <p className="text-xs text-[#5a6478]">
          Enter your WhatsApp phone number to receive a pairing code
        </p>
      </div>

      {!submitted && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+33612345678"
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
          <Button type="submit" loading={loading} size="sm">
            Request Code
          </Button>
        </form>
      )}

      {pairingCode && (
        <div className="text-center p-4 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-[10px]">
          <p className="text-xs text-[#5a6478] mb-2">Your pairing code</p>
          <p
            className="text-3xl font-mono font-bold text-[#22c55e] tracking-[0.3em]"
            data-testid="pairing-code-display"
          >
            {pairingCode}
          </p>
          <p className="text-xs text-[#5a6478] mt-2">
            Enter this code in WhatsApp → Linked Devices
          </p>
        </div>
      )}

      {submitted && !pairingCode && (
        <div className="flex items-center gap-2 text-sm text-[#5a6478]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
          Requesting pairing code...
        </div>
      )}
    </div>
  )
}

export default PairingCodeInput

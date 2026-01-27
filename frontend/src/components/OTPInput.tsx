import * as React from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  readonly length?: number
  readonly value: string
  readonly onChange: (value: string) => void
  readonly error?: boolean
}

function getInputClassName(hasError: boolean, hasValue: boolean): string {
  if (hasError) {
    return 'border-error bg-error-light'
  }
  if (hasValue) {
    return 'border-primary bg-primary-light'
  }
  return 'border-neutral-300 bg-white'
}

export function OTPInput({ length = 6, value, onChange, error }: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return

    const newValue = value.split('')
    newValue[index] = digit
    const result = newValue.join('').slice(0, length)
    onChange(result)

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replaceAll(/\D/g, '').slice(0, length)
    onChange(pastedData)
    const lastIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[lastIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, index) => {
        const inputId = `otp-input-${index}`
        return (
          <input
            key={inputId}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`Dígito ${index + 1} do código de verificação`}
            className={cn(
              'h-14 w-12 rounded-lg border text-center text-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
              getInputClassName(!!error, !!value[index])
            )}
          />
        )
      })}
    </div>
  )
}

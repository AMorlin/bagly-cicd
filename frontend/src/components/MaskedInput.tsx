import * as React from 'react'
import InputMask from 'react-input-mask'
import { cn } from '@/lib/utils'

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string
  error?: boolean
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, error, ...props }, ref) => {
    return (
      <InputMask
        mask={mask}
        {...props}
      >
        {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
          <input
            {...inputProps}
            ref={ref}
            className={cn(
              'flex h-12 w-full rounded-lg border bg-white px-4 py-3 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-error bg-error-light focus-visible:ring-error'
                : 'border-neutral-300',
              className
            )}
          />
        )}
      </InputMask>
    )
  }
)
MaskedInput.displayName = 'MaskedInput'

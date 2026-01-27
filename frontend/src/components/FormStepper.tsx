import { cn } from '@/lib/utils'

interface FormStepperProps {
  readonly currentStep: number
  readonly steps: readonly string[]
}

export function FormStepper({ currentStep, steps }: FormStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isActive && 'bg-primary text-white',
                  isCompleted && 'bg-primary text-white',
                  !isActive && !isCompleted && 'bg-neutral-200 text-neutral-500'
                )}
              >
                {stepNumber}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs',
                  isActive ? 'text-primary font-medium' : 'text-neutral-500'
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-8',
                  isCompleted ? 'bg-primary' : 'bg-neutral-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

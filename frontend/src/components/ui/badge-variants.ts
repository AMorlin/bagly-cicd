import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary-light text-primary',
        progress: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        pending: 'bg-orange-100 text-orange-800',
        cancelled: 'bg-neutral-100 text-neutral-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

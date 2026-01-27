import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  readonly to?: string
  readonly onClick?: () => void
}

export function BackButton({ to, onClick }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="absolute left-4 top-4"
    >
      <ChevronLeft className="h-6 w-6" />
    </Button>
  )
}

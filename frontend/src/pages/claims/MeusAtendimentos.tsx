import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/BackButton'
import { getClaims, Claim } from '@/services/claims'
import { AIRLINES } from '@/data/airlines'

const statusMap = {
  IN_PROGRESS: { label: 'Andamento', variant: 'progress' as const },
  COMPLETED: { label: 'Concluído', variant: 'completed' as const },
  CANCELLED: { label: 'Cancelado', variant: 'cancelled' as const },
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-neutral-500">Carregando...</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="mb-4 text-neutral-500">
        Você ainda não possui atendimentos.
      </p>
    </div>
  )
}

interface ClaimsListProps {
  readonly claims: Claim[]
  readonly onClaimClick: (id: string) => void
  readonly getAirlineName: (code: string) => string
  readonly formatDate: (dateString: string) => string
}

function ClaimsList({ claims, onClaimClick, getAirlineName, formatDate }: ClaimsListProps) {
  return (
    <div className="flex flex-col gap-4">
      {claims.map((claim) => (
        <Card
          key={claim.id}
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onClaimClick(claim.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">
                  {getAirlineName(claim.airline)}
                </h3>
                <p className="text-sm text-neutral-700">
                  {claim.airportName} - {claim.airportCode}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatDate(claim.flightDate)}
                </p>
              </div>
              <Badge variant={statusMap[claim.status].variant}>
                {statusMap[claim.status].label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function MeusAtendimentos() {
  const navigate = useNavigate()

  const { data: claims, isLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: getClaims,
  })

  const getAirlineName = (code: string) => {
    const airline = AIRLINES.find((a) => a.value === code)
    return airline?.label || code
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleClaimClick = (id: string) => {
    navigate(`/claims/${id}`)
  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />
    }

    if (claims && claims.length > 0) {
      return (
        <ClaimsList
          claims={claims}
          onClaimClick={handleClaimClick}
          getAirlineName={getAirlineName}
          formatDate={formatDate}
        />
      )
    }

    return <EmptyState />
  }

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-12">
      <BackButton to="/" />

      <div className="mt-16">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">
          Meus Atendimentos
        </h1>

        {renderContent()}

        <div className="fixed bottom-6 left-6 right-6">
          <Button
            className="w-full"
            onClick={() => navigate('/claims/new/step-1')}
          >
            Registrar Atendimento
          </Button>
        </div>
      </div>
    </div>
  )
}

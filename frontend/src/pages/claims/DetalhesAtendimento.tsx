import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/BackButton'
import { getClaimById } from '@/services/claims'
import { AIRLINES } from '@/data/airlines'

const statusMap = {
  IN_PROGRESS: { label: 'Andamento', variant: 'progress' as const },
  COMPLETED: { label: 'Concluído', variant: 'completed' as const },
  CANCELLED: { label: 'Cancelado', variant: 'cancelled' as const },
}

export default function DetalhesAtendimento() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: claim, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: () => getClaimById(id!),
    enabled: !!id,
  })

  const getAirlineName = (code: string) => {
    const airline = AIRLINES.find((a) => a.value === code)
    return airline?.label || code
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Carregando...</p>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Atendimento não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-12 pb-24">
      <BackButton to="/claims" />

      <div className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">
            {getAirlineName(claim.airline)}
          </h1>
          <Badge variant={statusMap[claim.status].variant}>
            {statusMap[claim.status].label}
          </Badge>
        </div>

        <div className="mb-6 flex flex-col gap-2 text-sm text-neutral-700">
          <p>
            <span className="font-medium">Protocolo:</span> {claim.protocol}
          </p>
          <p>
            <span className="font-medium">Aeroporto:</span> {claim.airportName} ({claim.airportCode})
          </p>
          <p>
            <span className="font-medium">Data do voo:</span> {formatDate(claim.flightDate)}
          </p>
          <p>
            <span className="font-medium">Localizador:</span> {claim.locator}
          </p>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Seu relato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700">{claim.damageDescription}</p>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Conteúdo da bagagem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700">{claim.baggageContents}</p>
          </CardContent>
        </Card>

        {claim.images && claim.images.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Imagens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {claim.images.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt="Imagem do dano"
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {claim.proposalText && (
          <Card className="mb-4 border-primary">
            <CardHeader>
              <CardTitle className="text-lg">Proposta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700">{claim.proposalText}</p>
              {claim.proposalValue && (
                <p className="mt-2 text-lg font-semibold text-primary">
                  R$ {claim.proposalValue.toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

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

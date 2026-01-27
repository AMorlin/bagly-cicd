import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/BackButton'
import { FormStepper } from '@/components/FormStepper'
import { useClaimFormStore } from '@/stores/claim'
import { createClaim } from '@/services/claims'
import { useToast } from '@/hooks/use-toast'
import { AIRLINES } from '@/data/airlines'
import { getAirportByCode } from '@/data/airports'
import { formatCPF, formatPhone } from '@/utils/validators'

const STEPS = ['Sobre você', 'Seu voo', 'O que aconteceu', 'Revisão']

const BAGGAGE_SIZES: Record<string, string> = {
  SMALL: 'Pequena (até 10kg)',
  MEDIUM: 'Média (até 23kg)',
  LARGE: 'Grande (até 32kg)',
}

export default function RevisaoDados() {
  const navigate = useNavigate()
  const { formData, resetFormData } = useClaimFormStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getAirlineName = (code: string) => {
    const airline = AIRLINES.find((a) => a.value === code)
    return airline?.label || code
  }

  const getAirportName = (code: string) => {
    const airport = getAirportByCode(code)
    return airport ? `${airport.name} (${airport.code})` : code
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const [day, month, year] = formData.flightDate.split('/')
      const flightDate = `${year}-${month}-${day}`

      await createClaim({
        fullName: formData.fullName,
        cpf: formData.cpf.replaceAll(/\D/g, ''),
        phone: formData.phone.replaceAll(/\D/g, ''),
        email: formData.email,
        airline: formData.airline,
        airportCode: formData.airportCode,
        flightDate,
        locator: formData.locator,
        baggageSize: formData.baggageSize,
        milesClub: formData.milesClub || undefined,
        milesNumber: formData.milesNumber || undefined,
        damageDescription: formData.damageDescription,
        baggageContents: formData.baggageContents,
        images: formData.images,
      })

      resetFormData()
      navigate('/claims/new/success')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível enviar sua reclamação. Tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-12 pb-24">
      <BackButton to="/claims/new/step-3" />

      <div className="mt-12">
        <FormStepper currentStep={4} steps={STEPS} />

        <h1 className="mb-6 text-2xl font-bold text-neutral-900">
          Revise seus dados
        </h1>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Dados pessoais</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/claims/new/step-1')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Nome:</span> {formData.fullName}
              </p>
              <p>
                <span className="font-medium">CPF:</span> {formatCPF(formData.cpf)}
              </p>
              <p>
                <span className="font-medium">Telefone:</span> {formatPhone(formData.phone)}
              </p>
              <p>
                <span className="font-medium">E-mail:</span> {formData.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Dados do voo</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/claims/new/step-2')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Companhia:</span>{' '}
                {getAirlineName(formData.airline)}
              </p>
              <p>
                <span className="font-medium">Aeroporto:</span>{' '}
                {getAirportName(formData.airportCode)}
              </p>
              <p>
                <span className="font-medium">Data do voo:</span> {formData.flightDate}
              </p>
              <p>
                <span className="font-medium">Localizador:</span> {formData.locator}
              </p>
              <p>
                <span className="font-medium">Bagagem:</span>{' '}
                {BAGGAGE_SIZES[formData.baggageSize] || formData.baggageSize}
              </p>
              {formData.milesClub && (
                <p>
                  <span className="font-medium">Clube de milhas:</span>{' '}
                  {formData.milesClub}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Descrição e imagens</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/claims/new/step-3')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium">Descrição do dano:</p>
                <p className="text-sm text-neutral-700">
                  {formData.damageDescription}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Conteúdo da bagagem:</p>
                <p className="text-sm text-neutral-700">
                  {formData.baggageContents}
                </p>
              </div>
              {formData.images.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Imagens ({formData.images.length}):
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.map((url, index) => {
                      const imageKey = `review-image-${url.slice(-20)}`
                      return (
                        <img
                          key={imageKey}
                          src={url}
                          alt={`Imagem ${index + 1}`}
                          className="aspect-square rounded-lg object-cover"
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/claims/new/step-3')}
            >
              Voltar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar e Enviar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

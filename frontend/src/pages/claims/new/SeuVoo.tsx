import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MaskedInput } from '@/components/MaskedInput'
import { BackButton } from '@/components/BackButton'
import { FormStepper } from '@/components/FormStepper'
import { useClaimFormStore } from '@/stores/claim'
import { AIRLINES } from '@/data/airlines'
import { BRAZILIAN_AIRPORTS } from '@/data/airports'

const STEPS = ['Sobre você', 'Seu voo', 'O que aconteceu', 'Revisão']

const BAGGAGE_SIZES = [
  { value: 'SMALL', label: 'Pequena (até 10kg)' },
  { value: 'MEDIUM', label: 'Média (até 23kg)' },
  { value: 'LARGE', label: 'Grande (até 32kg)' },
]

const MILES_CLUBS = [
  { value: 'SMILES', label: 'Smiles' },
  { value: 'LATAM_PASS', label: 'LATAM Pass' },
  { value: 'TUDOAZUL', label: 'TudoAzul' },
  { value: 'OTHER', label: 'Outro' },
]

const seuVooSchema = z.object({
  airline: z.string().min(1, 'Selecione a companhia aérea'),
  airportCode: z.string().min(1, 'Selecione o aeroporto'),
  flightDate: z.string().min(10, 'Data do voo é obrigatória'),
  locator: z
    .string()
    .min(5, 'Localizador deve ter pelo menos 5 caracteres')
    .max(10, 'Localizador deve ter no máximo 10 caracteres'),
  baggageSize: z.string().min(1, 'Selecione o tamanho da bagagem'),
  milesClub: z.string().optional(),
  milesNumber: z.string().optional(),
})

type SeuVooFormData = z.infer<typeof seuVooSchema>

export default function SeuVoo() {
  const navigate = useNavigate()
  const { formData, updateFormData } = useClaimFormStore()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SeuVooFormData>({
    resolver: zodResolver(seuVooSchema),
    defaultValues: {
      airline: formData.airline,
      airportCode: formData.airportCode,
      flightDate: formData.flightDate,
      locator: formData.locator,
      baggageSize: formData.baggageSize,
      milesClub: formData.milesClub,
      milesNumber: formData.milesNumber,
    },
  })

  const onSubmit = (data: SeuVooFormData) => {
    updateFormData(data)
    navigate('/claims/new/step-3')
  }

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-12 pb-24">
      <BackButton to="/claims/new/step-1" />

      <div className="mt-12">
        <FormStepper currentStep={2} steps={STEPS} />

        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Seu voo</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Companhia Aérea</Label>
            <Controller
              name="airline"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger error={!!errors.airline}>
                    <SelectValue placeholder="Selecione a companhia" />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRLINES.map((airline) => (
                      <SelectItem key={airline.value} value={airline.value}>
                        {airline.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.airline && (
              <span className="text-sm text-error">{errors.airline.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Aeroporto</Label>
            <Controller
              name="airportCode"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger error={!!errors.airportCode}>
                    <SelectValue placeholder="Selecione o aeroporto" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_AIRPORTS.map((airport) => (
                      <SelectItem key={airport.code} value={airport.code}>
                        {airport.name} ({airport.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.airportCode && (
              <span className="text-sm text-error">{errors.airportCode.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="flightDate">Data do voo</Label>
            <MaskedInput
              id="flightDate"
              mask="99/99/9999"
              placeholder="DD/MM/AAAA"
              error={!!errors.flightDate}
              {...register('flightDate')}
            />
            {errors.flightDate && (
              <span className="text-sm text-error">{errors.flightDate.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="locator">Localizador</Label>
            <Input
              id="locator"
              placeholder="Ex: ABC123"
              error={!!errors.locator}
              {...register('locator', { setValueAs: (v) => v.toUpperCase() })}
            />
            <span className="text-xs text-neutral-500">
              O localizador está no seu bilhete ou e-mail de confirmação
            </span>
            {errors.locator && (
              <span className="text-sm text-error">{errors.locator.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tamanho da Bagagem</Label>
            <Controller
              name="baggageSize"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger error={!!errors.baggageSize}>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    {BAGGAGE_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.baggageSize && (
              <span className="text-sm text-error">{errors.baggageSize.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Clube de Milhas (opcional)</Label>
            <Controller
              name="milesClub"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {MILES_CLUBS.map((club) => (
                      <SelectItem key={club.value} value={club.value}>
                        {club.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="milesNumber">Número do clube (opcional)</Label>
            <Input
              id="milesNumber"
              placeholder="Número do programa"
              {...register('milesNumber')}
            />
          </div>

          <Button type="submit" className="mt-4 w-full">
            Avançar
          </Button>
        </form>
      </div>
    </div>
  )
}

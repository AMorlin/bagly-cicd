import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MaskedInput } from '@/components/MaskedInput'
import { BackButton } from '@/components/BackButton'
import { FormStepper } from '@/components/FormStepper'
import { validateCPF } from '@/utils/validators'
import { useClaimFormStore } from '@/stores/claim'

const STEPS = ['Sobre você', 'Seu voo', 'O que aconteceu', 'Revisão']

const sobreVoceSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z
    .string()
    .min(14, 'CPF é obrigatório')
    .refine((val) => validateCPF(val), 'CPF inválido'),
  phone: z
    .string()
    .min(14, 'Telefone é obrigatório'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(255, 'E-mail muito longo'),
})

type SobreVoceFormData = z.infer<typeof sobreVoceSchema>

export default function SobreVoce() {
  const navigate = useNavigate()
  const { formData, updateFormData } = useClaimFormStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SobreVoceFormData>({
    resolver: zodResolver(sobreVoceSchema),
    defaultValues: {
      fullName: formData.fullName,
      cpf: formData.cpf,
      phone: formData.phone,
      email: formData.email,
    },
  })

  const onSubmit = (data: SobreVoceFormData) => {
    updateFormData(data)
    navigate('/claims/new/step-2')
  }

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-12">
      <BackButton to="/claims" />

      <div className="mt-12">
        <FormStepper currentStep={1} steps={STEPS} />

        <h1 className="mb-6 text-2xl font-bold text-neutral-900">
          Sobre você
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              placeholder="Seu nome completo"
              error={!!errors.fullName}
              {...register('fullName')}
            />
            {errors.fullName && (
              <span className="text-sm text-error">{errors.fullName.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cpf">CPF</Label>
            <MaskedInput
              id="cpf"
              mask="999.999.999-99"
              placeholder="000.000.000-00"
              error={!!errors.cpf}
              {...register('cpf')}
            />
            {errors.cpf && (
              <span className="text-sm text-error">{errors.cpf.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <MaskedInput
              id="phone"
              mask="(99) 99999-9999"
              placeholder="(00) 00000-0000"
              error={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && (
              <span className="text-sm text-error">{errors.phone.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <span className="text-sm text-error">{errors.email.message}</span>
            )}
          </div>

          <Button type="submit" className="mt-4 w-full">
            Avançar
          </Button>
        </form>
      </div>
    </div>
  )
}

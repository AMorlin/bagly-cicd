import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MaskedInput } from '@/components/MaskedInput'
import { BackButton } from '@/components/BackButton'
import { validateCPF } from '@/utils/validators'
import { requestOtp } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/hooks/use-toast'

const cpfSchema = z.object({
  cpf: z
    .string()
    .min(14, 'CPF é obrigatório')
    .refine((val) => validateCPF(val), 'CPF inválido'),
})

const cpfEmailSchema = z.object({
  cpf: z
    .string()
    .min(14, 'CPF é obrigatório')
    .refine((val) => validateCPF(val), 'CPF inválido'),
  email: z.string().email('E-mail inválido'),
})

type CPFFormData = z.infer<typeof cpfSchema>
type CPFEmailFormData = z.infer<typeof cpfEmailSchema>

export default function InformeCPF() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || 'new'
  const { setCpf, setEmail } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [requiresEmail, setRequiresEmail] = useState(false)
  const [savedCpf, setSavedCpf] = useState('')

  const cpfForm = useForm<CPFFormData>({
    resolver: zodResolver(cpfSchema),
  })

  const emailForm = useForm<CPFEmailFormData>({
    resolver: zodResolver(cpfEmailSchema),
  })

  const onSubmitCpf = async (data: CPFFormData) => {
    setIsLoading(true)
    try {
      const cleanCPF = data.cpf.replaceAll(/\D/g, '')
      const response = await requestOtp(cleanCPF)

      if (response.requiresEmail) {
        setSavedCpf(cleanCPF)
        setRequiresEmail(true)
        emailForm.setValue('cpf', data.cpf)
      } else {
        setCpf(cleanCPF)
        setEmail(response.email || '')
        navigate(`/auth/verify?action=${action}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível enviar o código. Tente novamente.'
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitEmail = async (data: CPFEmailFormData) => {
    setIsLoading(true)
    try {
      const cleanCPF = savedCpf || data.cpf.replaceAll(/\D/g, '')
      const response = await requestOtp(cleanCPF, data.email)

      setCpf(cleanCPF)
      setEmail(response.email || data.email)
      navigate(`/auth/verify?action=${action}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível enviar o código. Tente novamente.'
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (requiresEmail) {
    return (
      <div className="relative flex min-h-screen flex-col px-6 py-12">
        <BackButton onClick={() => setRequiresEmail(false)} />

        <div className="mt-16 flex flex-col">
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">
            Informe seu e-mail
          </h1>
          <p className="mb-8 text-neutral-700">
            Não encontramos seu CPF cadastrado. Informe seu e-mail para criar sua conta.
          </p>

          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <MaskedInput
                id="cpf"
                mask="999.999.999-99"
                placeholder="000.000.000-00"
                error={!!emailForm.formState.errors.cpf}
                disabled
                {...emailForm.register('cpf')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className={emailForm.formState.errors.email ? 'border-error' : ''}
                {...emailForm.register('email')}
              />
              {emailForm.formState.errors.email && (
                <span className="text-sm text-error">{emailForm.formState.errors.email.message}</span>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar código'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-12">
      <BackButton to="/" />

      <div className="mt-16 flex flex-col">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">
          Informe seu CPF
        </h1>
        <p className="mb-8 text-neutral-700">
          Enviaremos um código de verificação para o e-mail cadastrado.
        </p>

        <form onSubmit={cpfForm.handleSubmit(onSubmitCpf)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cpf">CPF</Label>
            <MaskedInput
              id="cpf"
              mask="999.999.999-99"
              placeholder="000.000.000-00"
              error={!!cpfForm.formState.errors.cpf}
              {...cpfForm.register('cpf')}
            />
            {cpfForm.formState.errors.cpf && (
              <span className="text-sm text-error">{cpfForm.formState.errors.cpf.message}</span>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar código'}
          </Button>
        </form>
      </div>
    </div>
  )
}

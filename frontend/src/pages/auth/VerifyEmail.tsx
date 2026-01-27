import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/BackButton'
import { OTPInput } from '@/components/OTPInput'
import { verifyOtp, resendOtp } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import { useClaimFormStore } from '@/stores/claim'
import { maskEmail } from '@/utils/validators'
import { useToast } from '@/hooks/use-toast'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || 'new'
  const { cpf, email, setToken, setUser } = useAuthStore()
  const { updateFormData } = useClaimFormStore()
  const { toast } = useToast()

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError(true)
      return
    }

    if (!cpf) {
      navigate('/auth/cpf')
      return
    }

    setIsLoading(true)
    setError(false)

    try {
      const response = await verifyOtp(cpf, code)
      setToken(response.token)
      setUser(response.user)

      if (response.user.name) {
        updateFormData({
          fullName: response.user.name,
          cpf: response.user.cpf,
          email: response.user.email,
          phone: response.user.phone || '',
        })
      }

      if (action === 'new') {
        navigate('/claims/new/step-1')
      } else {
        navigate('/claims')
      }
    } catch {
      setError(true)
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'Verifique o código e tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!cpf) return

    setIsResending(true)
    try {
      await resendOtp(cpf)
      toast({
        title: 'Código reenviado',
        description: 'Verifique seu e-mail.',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível reenviar o código.',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-12">
      <BackButton to="/auth/cpf" />

      <div className="mt-16 flex flex-col items-center">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">
          Verifique seu e-mail
        </h1>
        <p className="mb-8 text-center text-neutral-700">
          Enviamos um código de 6 dígitos para{' '}
          <span className="font-medium">{email ? maskEmail(email) : '***@***.com'}</span>
        </p>

        <div className="mb-6 w-full max-w-sm">
          <OTPInput
            length={6}
            value={code}
            onChange={setCode}
            error={error}
          />
        </div>

        <Button
          className="mb-4 w-full max-w-sm"
          onClick={handleVerify}
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? 'Verificando...' : 'Verificar código'}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          {isResending ? 'Reenviando...' : 'Não recebeu o e-mail? Clique para reenviar'}
        </button>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Confirmacao() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-status-completed" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          Recebemos sua reclamação!
        </h1>

        <p className="mb-8 max-w-sm text-neutral-700">
          Sua solicitação foi registrada com sucesso. Você receberá uma resposta
          em até 24 horas úteis no e-mail cadastrado.
        </p>

        <Button
          className="w-full max-w-sm"
          onClick={() => navigate('/claims')}
        >
          Acompanhar solicitação
        </Button>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary">
          <span className="text-4xl font-bold text-white">b</span>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          Sentimos muito pelo o ocorrido!
        </h1>

        <p className="mb-8 max-w-sm text-neutral-700">
          Estamos aqui para ajudar você a registrar e acompanhar sua reclamação
          de bagagem danificada.
        </p>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/auth/cpf?action=new')}
          >
            Registrar um atendimento
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/auth/cpf?action=track')}
          >
            Acompanhar um atendimento
          </Button>
        </div>
      </div>
    </div>
  )
}

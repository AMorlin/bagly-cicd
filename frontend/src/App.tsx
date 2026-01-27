import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Home from '@/pages/Home'
import InformeCPF from '@/pages/auth/InformeCPF'
import VerifyEmail from '@/pages/auth/VerifyEmail'
import MeusAtendimentos from '@/pages/claims/MeusAtendimentos'
import DetalhesAtendimento from '@/pages/claims/DetalhesAtendimento'
import SobreVoce from '@/pages/claims/new/SobreVoce'
import SeuVoo from '@/pages/claims/new/SeuVoo'
import ConteOQueAconteceu from '@/pages/claims/new/ConteOQueAconteceu'
import RevisaoDados from '@/pages/claims/new/RevisaoDados'
import Confirmacao from '@/pages/claims/new/Confirmacao'

function App() {
  return (
    <>
      <div className="min-h-screen bg-neutral-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/cpf" element={<InformeCPF />} />
          <Route path="/auth/verify" element={<VerifyEmail />} />
          <Route path="/claims" element={<MeusAtendimentos />} />
          <Route path="/claims/:id" element={<DetalhesAtendimento />} />
          <Route path="/claims/new/step-1" element={<SobreVoce />} />
          <Route path="/claims/new/step-2" element={<SeuVoo />} />
          <Route path="/claims/new/step-3" element={<ConteOQueAconteceu />} />
          <Route path="/claims/new/review" element={<RevisaoDados />} />
          <Route path="/claims/new/success" element={<Confirmacao />} />
        </Routes>
      </div>
      <Toaster />
    </>
  )
}

export default App

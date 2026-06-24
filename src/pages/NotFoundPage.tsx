import { Button } from '@/components/ui/Button'
import { Home, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-surface">
          <span className="text-6xl font-bold text-primary-500/20 select-none">404</span>
      <h1 className="mt-4 text-lg font-semibold text-text-primary">Página não encontrada</h1>
      <p className="mt-1 text-sm text-text-secondary max-w-sm">
        A rota acessada não existe ou foi movida.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Voltar
        </Button>
        <Button onClick={() => navigate('/dashboard')}>
          <Home size={16} /> Dashboard
        </Button>
      </div>
    </div>
  )
}

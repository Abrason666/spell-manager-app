import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <span className="text-6xl">🔮</span>
      <h1 className="text-2xl font-bold">Pagina non trovata</h1>
      <Button onClick={() => navigate('/')}>Torna alla home</Button>
    </div>
  )
}

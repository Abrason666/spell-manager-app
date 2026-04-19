import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AuthPage } from '@/pages/AuthPage'
import { CharactersPage } from '@/pages/CharactersPage'
import { SpellbookPage } from '@/pages/SpellbookPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/characters" element={<AuthGuard><CharactersPage /></AuthGuard>} />
          <Route path="/spellbook" element={<AuthGuard><SpellbookPage /></AuthGuard>} />
          <Route path="/spellbook/:charId" element={<AuthGuard><SpellbookPage /></AuthGuard>} />
          <Route path="/" element={<Navigate to="/characters" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

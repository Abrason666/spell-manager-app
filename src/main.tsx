import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Applica il tema salvato prima del render per evitare il flash
;(function initTheme() {
  try {
    const stored = JSON.parse(localStorage.getItem('spell-manager-theme') ?? '{}')
    const theme: string = stored?.state?.theme ?? 'dark'
    document.documentElement.classList.toggle('dark', theme === 'dark')
  } catch {
    document.documentElement.classList.add('dark')
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton'
import { Spinner } from '@/components/ui/spinner'
import { useThemeStore } from '@/stores/themeStore'
import { Sword, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AuthPage() {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { theme, toggleTheme } = useThemeStore()

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Spinner className="h-10 w-10 text-primary" />
    </div>
  )
  if (user) return <Navigate to="/characters" replace />

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Sfondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-secondary/30 blur-[80px]" />
      </div>

      {/* Card login */}
      <div className="relative w-full max-w-sm">
        {/* Toggle tema */}
        <button
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card/80 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modalità chiara' : 'Modalità scura'}
        >
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              <Sword className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="font-fantasy text-xl font-bold text-primary tracking-wide">Spell Manager</h1>
              <p className="text-xs text-muted-foreground mt-0.5">D&D 5e — Il tuo grimorio digitale</p>
            </div>
          </div>

          {/* Google OAuth */}
          <GoogleOAuthButton />

          {/* Divisore */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-[11px] uppercase tracking-widest text-muted-foreground">oppure</span>
            </div>
          </div>

          {/* Form */}
          {mode === 'login'
            ? <LoginForm onSwitch={() => setMode('register')} />
            : <RegisterForm onSwitch={() => setMode('login')} />
          }

          {/* Switch */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === 'login' ? 'Nuovo qui?' : 'Hai già un account?'}{' '}
            <button
              className="font-medium text-primary hover:underline"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Registrati' : 'Accedi'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

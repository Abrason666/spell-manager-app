import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RegisterFormProps {
  onSwitch: () => void
}

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Le password non coincidono')
      return
    }
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess(true)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-2xl">📧</p>
        <p className="font-medium">Controlla la tua email!</p>
        <p className="text-sm text-muted-foreground">
          Ti abbiamo inviato un link di conferma a <strong>{email}</strong>
        </p>
        <Button variant="outline" onClick={onSwitch} className="w-full">
          Torna al login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="mago@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-confirm">Conferma password</Label>
        <Input
          id="reg-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Registrazione...' : 'Crea account'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Hai già un account?{' '}
        <button type="button" onClick={onSwitch} className="text-primary hover:underline">
          Accedi
        </button>
      </p>
    </form>
  )
}

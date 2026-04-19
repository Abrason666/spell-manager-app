import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SPELL_CLASSES, CLASS_LABELS, CLASS_ICONS } from '@/lib/utils'
import { X } from 'lucide-react'
import type { Character } from '@/types'

export interface CharacterFormData {
  name: string
  class: string
  level: number
  class2: string | null
  level2: number | null
  notes: string
}

interface CharacterFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: CharacterFormData) => Promise<void>
  initial?: Character | null
}

export function CharacterFormModal({ open, onClose, onSave, initial }: CharacterFormModalProps) {
  const [name, setName]     = useState('')
  const [cls, setCls]       = useState('wizard')
  const [level, setLevel]   = useState(1)
  const [cls2, setCls2]     = useState<string | null>(null)
  const [level2, setLevel2] = useState(1)
  const [notes, setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setCls(initial.class)
      setLevel(initial.level)
      setCls2(initial.class2 ?? null)
      setLevel2(initial.level2 ?? 1)
      setNotes(initial.notes ?? '')
    } else {
      setName(''); setCls('wizard'); setLevel(1)
      setCls2(null); setLevel2(1); setNotes('')
    }
    setError(null)
  }, [initial, open])

  async function handleSave() {
    if (!name.trim()) { setError('Il nome è obbligatorio'); return }
    if (level < 1 || level > 20) { setError('Livello non valido (1–20)'); return }
    if (cls2) {
      if (cls2 === cls) { setError('Le due classi devono essere diverse'); return }
      if (level2 < 1 || level + level2 > 20) { setError(`Livello totale (${level + level2}) supera il massimo di 20`); return }
    }
    setLoading(true)
    setError(null)
    try {
      await onSave({
        name: name.trim(), class: cls, level,
        class2: cls2, level2: cls2 ? level2 : null,
        notes,
      })
      onClose()
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message
      setError(msg ?? 'Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  const secondClasses = SPELL_CLASSES.filter(c => c !== cls)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Modifica personaggio' : 'Nuovo personaggio'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input placeholder="Gandalf il Grigio" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Classe + Livello */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={cls} onValueChange={(v) => { setCls(v); if (v === cls2) setCls2(null) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPELL_CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>{CLASS_ICONS[c]} {CLASS_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Livello</Label>
              <Input type="number" min={1} max={20} value={level} onChange={(e) => setLevel(Number(e.target.value))} />
            </div>
          </div>

          {/* Seconda classe */}
          {cls2 ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Seconda classe</Label>
                  <button
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-0.5"
                    onClick={() => setCls2(null)}
                  >
                    <X className="h-3 w-3" /> rimuovi
                  </button>
                </div>
                <Select value={cls2} onValueChange={setCls2}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {secondClasses.map((c) => (
                      <SelectItem key={c} value={c}>{CLASS_ICONS[c]} {CLASS_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Livello (max {20 - level})</Label>
                <Input type="number" min={1} max={20 - level} value={level2} onChange={(e) => setLevel2(Number(e.target.value))} />
              </div>
            </div>
          ) : (
            <button
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
              onClick={() => setCls2(secondClasses[0])}
            >
              + aggiungi altra classe
            </button>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label>Note (opzionale)</Label>
            <Textarea placeholder="Background, note di gioco..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

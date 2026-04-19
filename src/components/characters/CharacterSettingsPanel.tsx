import { useState, useEffect } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SPELL_CLASSES, CLASS_LABELS, CLASS_ICONS, CLASS_COLORS, cn } from '@/lib/utils'
import type { Character } from '@/types'

interface CharacterSettingsPanelProps {
  character: Character
  onSave: (data: { name: string; class: string; level: number; class2: string | null; level2: number | null; notes: string }) => Promise<void>
}

export function CharacterSettingsPanel({ character, onSave }: CharacterSettingsPanelProps) {
  const [name, setName]     = useState(character.name)
  const [cls, setCls]       = useState(character.class)
  const [level, setLevel]   = useState(character.level)
  const [cls2, setCls2]     = useState<string | null>(character.class2 ?? null)
  const [level2, setLevel2] = useState<number>(character.level2 ?? 1)
  const [notes, setNotes]   = useState(character.notes ?? '')
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    setName(character.name)
    setCls(character.class)
    setLevel(character.level)
    setCls2(character.class2 ?? null)
    setLevel2(character.level2 ?? 1)
    setNotes(character.notes ?? '')
    setSaved(false)
    setError(null)
  }, [character.id])

  const isDirty =
    name.trim() !== character.name ||
    cls         !== character.class ||
    level       !== character.level ||
    (cls2 ?? null)   !== (character.class2 ?? null) ||
    (cls2 ? level2 : null) !== (character.level2 ?? null) ||
    (notes ?? '') !== (character.notes ?? '')

  async function handleSave() {
    if (!name.trim()) { setError('Il nome è obbligatorio'); return }
    if (level < 1 || level > 20) { setError('Il livello deve essere tra 1 e 20'); return }
    if (cls2 && (level2 < 1 || level2 > 20)) { setError('Il livello della seconda classe deve essere tra 1 e 20'); return }
    if (cls2 === cls) { setError('Le due classi devono essere diverse'); return }
    const totalLevel = level + (cls2 ? level2 : 0)
    if (totalLevel > 20) { setError(`Livello totale (${totalLevel}) supera il massimo di 20`); return }
    setLoading(true)
    setError(null)
    try {
      await onSave({ name: name.trim(), class: cls, level, class2: cls2, level2: cls2 ? level2 : null, notes })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message
      setError(msg ?? 'Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  const classColor  = CLASS_COLORS[cls]  ?? 'bg-muted text-muted-foreground border-muted'
  const classColor2 = cls2 ? (CLASS_COLORS[cls2] ?? 'bg-muted text-muted-foreground border-muted') : null

  const availableSecondClasses = SPELL_CLASSES.filter(c => c !== cls)

  return (
    <div className="space-y-6">
      {/* Preview identità */}
      <div className={cn('flex items-center gap-4 rounded-xl border p-4', classColor)}>
        <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl border', classColor)}>
          {CLASS_ICONS[cls] ?? '🧙'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-fantasy font-bold text-lg leading-tight truncate">{name || '—'}</p>
          <p className="text-sm opacity-80">
            {CLASS_LABELS[cls] ?? cls} Lv.{level}
            {cls2 && <> / {CLASS_LABELS[cls2] ?? cls2} Lv.{level2}</>}
          </p>
        </div>
        {cls2 && classColor2 && (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl border', classColor2)}>
            {CLASS_ICONS[cls2] ?? '🧙'}
          </div>
        )}
      </div>

      {/* Campi classe principale */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input placeholder="Gandalf il Grigio" value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Classe</Label>
            <Select value={cls} onValueChange={(v) => { setCls(v); setSaved(false); if (v === cls2) setCls2(null) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPELL_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>{CLASS_ICONS[c]} {CLASS_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Livello (1–20)</Label>
            <Input type="number" min={1} max={20}
              value={level || ''}
              onChange={(e) => { const n = parseInt(e.target.value, 10); setLevel(isNaN(n) ? 0 : n); setSaved(false) }}
              onBlur={() => { if (!level || level < 1) setLevel(1) }}
            />
          </div>
        </div>

        {/* Seconda classe */}
        {cls2 ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Seconda classe</Label>
                <button
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-0.5"
                  onClick={() => { setCls2(null); setSaved(false) }}
                >
                  <X className="h-3 w-3" /> rimuovi
                </button>
              </div>
              <Select value={cls2} onValueChange={(v) => { setCls2(v); setSaved(false) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableSecondClasses.map((c) => (
                    <SelectItem key={c} value={c}>{CLASS_ICONS[c]} {CLASS_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Livello (max {20 - level})</Label>
              <Input
                type="number" min={1} max={20 - level}
                value={level2 || ''}
                onChange={(e) => { const n = parseInt(e.target.value, 10); setLevel2(isNaN(n) ? 0 : n); setSaved(false) }}
                onBlur={() => { if (!level2 || level2 < 1) setLevel2(1) }}
              />
            </div>
          </div>
        ) : (
          <button
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
            onClick={() => { setCls2(availableSecondClasses[0]); setSaved(false) }}
          >
            + aggiungi altra classe
          </button>
        )}

        <div className="space-y-1.5">
          <Label>Note (opzionale)</Label>
          <Textarea
            placeholder="Background, alleanze, note di gioco..."
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setSaved(false) }}
            rows={4}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button className="w-full gap-2" onClick={handleSave} disabled={loading || !isDirty}>
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Salvataggio...</>
        ) : saved ? (
          <><Check className="h-4 w-4" /> Salvato!</>
        ) : (
          'Salva modifiche'
        )}
      </Button>
    </div>
  )
}

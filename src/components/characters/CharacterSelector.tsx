import { useNavigate } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CLASS_LABELS } from '@/lib/utils'
import type { Character } from '@/types'

interface CharacterSelectorProps {
  characters: Character[]
  activeId: string | null
}

export function CharacterSelector({ characters, activeId }: CharacterSelectorProps) {
  const navigate = useNavigate()

  if (characters.length === 0) return null

  return (
    <Select value={activeId ?? ''} onValueChange={(id) => navigate(`/spellbook/${id}`)}>
      <SelectTrigger className="w-48 h-8 text-sm">
        <SelectValue placeholder="Seleziona personaggio" />
      </SelectTrigger>
      <SelectContent>
        {characters.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name} — {CLASS_LABELS[c.class] ?? c.class}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

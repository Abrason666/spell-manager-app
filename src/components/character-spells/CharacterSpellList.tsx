import { useMemo } from 'react'
import { BookOpen } from 'lucide-react'
import { CharacterSpellCard } from './CharacterSpellCard'
import { Spinner } from '@/components/ui/spinner'
import { formatLevelLabel } from '@/lib/utils'
import type { CharacterSpell } from '@/types'

interface CharacterSpellListProps {
  charSpells: CharacterSpell[]
  characterId: string | null
  loading: boolean
  onRemove: (id: string) => void
  emptyMessage?: string
  emptySubMessage?: string
}

export function CharacterSpellList({
  charSpells,
  characterId,
  loading,
  onRemove,
  emptyMessage = 'Libro degli Incantesimi vuoto',
  emptySubMessage = 'Cerca e aggiungi incantesimi →',
}: CharacterSpellListProps) {

  const { cantrips, grouped } = useMemo(() => {
    const ct = charSpells
      .filter(cs => cs.spell.level === 0)
      .sort((a, b) => a.spell.name.localeCompare(b.spell.name))

    const map = new Map<number, CharacterSpell[]>()
    for (const cs of charSpells.filter(cs => cs.spell.level > 0)) {
      const lvl = cs.spell.level
      if (!map.has(lvl)) map.set(lvl, [])
      map.get(lvl)!.push(cs)
    }
    const grp = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([lvl, spells]) => [
        lvl,
        spells.slice().sort((a, b) => a.spell.name.localeCompare(b.spell.name)),
      ] as [number, CharacterSpell[]])

    return { cantrips: ct, grouped: grp }
  }, [charSpells])

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Spinner /></div>
  }

  if (charSpells.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 text-muted-foreground">
        <BookOpen className="h-8 w-8 opacity-30" />
        <div className="text-center">
          <p className="text-sm font-medium">{emptyMessage}</p>
          <p className="text-xs mt-0.5 opacity-70">{emptySubMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cantrips.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Trucchetti ({cantrips.length})
          </p>
          <div className="space-y-2">
            {cantrips.map(cs => (
              <CharacterSpellCard key={cs.id} charSpell={cs} characterId={characterId} onRemove={onRemove} />
            ))}
          </div>
        </div>
      )}

      {grouped.map(([level, spells]) => (
        <div key={level}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {formatLevelLabel(level)} ({spells.length})
          </p>
          <div className="space-y-2">
            {spells.map(cs => (
              <CharacterSpellCard key={cs.id} charSpell={cs} characterId={characterId} onRemove={onRemove} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

import { useState } from 'react'
import { SpellCard } from './SpellCard'
import { SpellDetailModal } from './SpellDetailModal'
import { Spinner } from '@/components/ui/spinner'
import type { Spell } from '@/types'

interface SpellListProps {
  spells: Spell[]
  spellIdsInList: Set<string>
  loading: boolean
  onAdd: (spell: Spell) => void
  onRemove?: (spell: Spell) => void
}

export function SpellList({ spells, spellIdsInList, loading, onAdd, onRemove }: SpellListProps) {
  const [detailSpell, setDetailSpell] = useState<Spell | null>(null)

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (spells.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
        Nessun incantesimo trovato.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-1.5">
        {spells.map((spell) => (
          <SpellCard
            key={spell.id}
            spell={spell}
            isInList={spellIdsInList.has(spell.id)}
            onAdd={onAdd}
            onRemove={onRemove}
            onViewDetail={setDetailSpell}
          />
        ))}
      </div>
      <SpellDetailModal spell={detailSpell} onClose={() => setDetailSpell(null)} />
    </>
  )
}

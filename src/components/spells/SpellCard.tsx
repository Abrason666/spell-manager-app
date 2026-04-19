import { Wand2, Check } from 'lucide-react'
import { SCHOOL_COLORS, SCHOOL_BORDER, formatLevel, cn } from '@/lib/utils'
import type { Spell } from '@/types'

interface SpellCardProps {
  spell: Spell
  isInList: boolean
  onAdd: (spell: Spell) => void
  onViewDetail: (spell: Spell) => void
}

export function SpellCard({ spell, isInList, onAdd, onViewDetail }: SpellCardProps) {
  const borderColor = SCHOOL_BORDER[spell.school] ?? 'border-l-border'

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-3.5 rounded-lg border border-border/60 bg-card',
        'border-l-2 hover:bg-accent/30 transition-colors cursor-pointer group',
        borderColor,
      )}
      onClick={() => onViewDetail(spell)}
    >
      {/* Livello */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-bold font-fantasy">
        {formatLevel(spell.level)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
          {spell.name}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-[6.5rem] shrink-0">
            <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium', SCHOOL_COLORS[spell.school] ?? 'bg-muted text-muted-foreground')}>
              {spell.school}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">{spell.casting_time}</span>
          <div className="flex gap-1">
            {spell.concentration && <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded px-1">C</span>}
            {spell.ritual && <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded px-1">R</span>}
          </div>
        </div>
      </div>

      {/* Aggiungi */}
      <button
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all',
          isInList
            ? 'border-primary/30 bg-primary/10 text-primary cursor-default'
            : 'border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/10 active:scale-95',
        )}
        onClick={(e) => { e.stopPropagation(); if (!isInList) onAdd(spell) }}
        title={isInList ? 'Già nel libro' : 'Aggiungi al libro degli incantesimi'}
      >
        {isInList ? <Check className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

import { Wand2, Check } from 'lucide-react'
import { SCHOOL_COLORS, SCHOOL_BORDER, formatLevel, cn } from '@/lib/utils'
import type { Spell } from '@/types'

interface SpellCardProps {
  spell: Spell
  isInList: boolean
  onAdd: (spell: Spell) => void
  onRemove?: (spell: Spell) => void
  onViewDetail: (spell: Spell) => void
}

export function SpellCard({ spell, isInList, onAdd, onRemove, onViewDetail }: SpellCardProps) {
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-fantasy">
        {formatLevel(spell.level)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
          {spell.name}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium shrink-0', SCHOOL_COLORS[spell.school] ?? 'bg-muted text-muted-foreground')}>
            {spell.school}
          </span>
          <div className="flex gap-1 shrink-0">
            {spell.concentration && <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded px-1">C</span>}
            {spell.ritual && <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded px-1">R</span>}
          </div>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{spell.casting_time}</p>
      </div>

      {/* Aggiungi / Rimuovi */}
      <button
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95',
          isInList && onRemove
            ? 'border-primary/30 bg-primary/10 text-primary hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive'
            : isInList
            ? 'border-primary/30 bg-primary/10 text-primary cursor-default'
            : 'border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/10',
        )}
        onClick={(e) => {
          e.stopPropagation()
          if (isInList && onRemove) onRemove(spell)
          else if (!isInList) onAdd(spell)
        }}
        title={isInList ? 'Rimuovi dal libro' : 'Aggiungi al libro'}
      >
        {isInList ? <Check className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

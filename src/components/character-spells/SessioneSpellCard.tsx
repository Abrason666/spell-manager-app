import { useState } from 'react'
import { SpellDetailModal } from '@/components/spells/SpellDetailModal'
import { SCHOOL_COLORS, SCHOOL_BORDER, formatLevel, cn } from '@/lib/utils'
import type { CharacterSpell } from '@/types'

interface SessioneSpellCardProps {
  charSpell: CharacterSpell
  canCast: boolean
  classDot?: string   // emoji classe, mostrato solo in multiclasse
}

export function SessioneSpellCard({ charSpell, canCast, classDot }: SessioneSpellCardProps) {
  const { spell } = charSpell
  const [showDetail, setShowDetail] = useState(false)
  const borderColor = SCHOOL_BORDER[spell.school] ?? 'border-l-border'

  return (
    <>
      <div
        className={cn(
          'rounded-lg border border-border/60 bg-card border-l-2 cursor-pointer transition-all',
          'hover:bg-accent/30',
          borderColor,
          !canCast && 'opacity-40 grayscale-[60%]',
        )}
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-center gap-3 px-3 py-3.5">
          {/* Livello */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-fantasy">
            {formatLevel(spell.level)}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm leading-tight truncate">{spell.name}</p>
              {classDot && <span className="text-sm leading-none shrink-0">{classDot}</span>}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-[6.5rem] shrink-0">
                <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium', SCHOOL_COLORS[spell.school] ?? 'bg-muted text-muted-foreground')}>
                  {spell.school}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">{spell.casting_time}</span>
              <div className="flex gap-1">
                {spell.concentration && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 dark:text-yellow-400 dark:bg-yellow-400/10 dark:border-yellow-400/20 rounded px-1">C</span>}
                {spell.ritual && <span className="text-[10px] font-bold text-violet-700 bg-violet-100 border border-violet-300 dark:text-purple-400 dark:bg-purple-400/10 dark:border-purple-400/20 rounded px-1">R</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Note personali — sempre visibili se presenti */}
        {charSpell.personal_notes && (
          <div className="px-3 pb-3 border-t border-border/40 pt-2">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              {charSpell.personal_notes}
            </p>
          </div>
        )}
      </div>

      <SpellDetailModal spell={showDetail ? spell : null} onClose={() => setShowDetail(false)} />
    </>
  )
}

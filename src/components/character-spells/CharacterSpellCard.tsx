import { useState } from 'react'
import { X, ChevronUp, Flame, Feather } from 'lucide-react'
import { SpellNotesEditor } from './SpellNotesEditor'
import { SpellDetailModal } from '@/components/spells/SpellDetailModal'
import { useTogglePrepared } from '@/hooks/useCharacterSpells'
import { SCHOOL_COLORS, SCHOOL_BORDER, formatLevel, cn } from '@/lib/utils'
import type { CharacterSpell } from '@/types'

interface CharacterSpellCardProps {
  charSpell: CharacterSpell
  characterId: string | null
  onRemove: (id: string) => void
}

export function CharacterSpellCard({ charSpell, characterId, onRemove }: CharacterSpellCardProps) {
  const { spell } = charSpell
  const [showNotes, setShowNotes] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const togglePrepared = useTogglePrepared(characterId)

  const isPrepared = charSpell.is_prepared
  const isCantrip = spell.level === 0
  const borderColor = SCHOOL_BORDER[spell.school] ?? 'border-l-border'

  return (
    <>
      <div className={cn(
        'rounded-lg border border-border/60 bg-card border-l-2 transition-all',
        borderColor,
        isPrepared && !isCantrip && 'bg-primary/5 border-primary/50 shadow-[0_0_8px_hsl(var(--primary)/0.15)]',
      )}>
        <div className="flex items-center gap-3 px-3 py-3.5">

          {/* Livello */}
          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold font-fantasy border',
            isPrepared && !isCantrip
              ? 'bg-primary/20 border-primary/40 text-primary'
              : 'bg-primary/8 border-primary/15 text-primary/70',
          )}>
            {formatLevel(spell.level)}
          </div>

          {/* Info — click per dettaglio */}
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setShowDetail(true)}>
            <p className="font-medium text-sm leading-tight truncate">{spell.name}</p>
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

          {/* Azioni */}
          <div className="flex shrink-0 items-center gap-1">
            {!isCantrip && (
              <button
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg border transition-all active:scale-95',
                  isPrepared
                    ? 'border-orange-400/50 bg-orange-400/15 text-orange-400'
                    : 'border-border/50 text-muted-foreground hover:text-orange-400 hover:border-orange-400/40 hover:bg-orange-400/8',
                )}
                onClick={() => togglePrepared.mutate({ id: charSpell.id, isPrepared: !isPrepared })}
                disabled={togglePrepared.isPending}
                title={isPrepared ? 'Rimuovi dalla preparazione' : 'Segna come preparato'}
              >
                <Flame className={cn('h-4 w-4', isPrepared && 'fill-orange-400')} />
              </button>
            )}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all active:scale-95"
              onClick={() => setShowNotes(!showNotes)}
              title="Note personali"
            >
              {showNotes ? <ChevronUp className="h-4 w-4" /> : <Feather className="h-4 w-4" />}
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all active:scale-95"
              onClick={() => onRemove(charSpell.id)}
              title="Rimuovi dal libro"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showNotes && (
          <div className="px-3 pb-3 border-t border-border/40 pt-2.5">
            <SpellNotesEditor
              characterSpellId={charSpell.id}
              characterId={characterId}
              initialNotes={charSpell.personal_notes}
            />
          </div>
        )}
      </div>

      <SpellDetailModal spell={showDetail ? spell : null} onClose={() => setShowDetail(false)} />
    </>
  )
}

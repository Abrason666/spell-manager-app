import { useState } from 'react'
import { Trash2, ChevronUp, Flame, Feather } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'
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

const DELETE_WIDTH = 72

export function CharacterSpellCard({ charSpell, characterId, onRemove }: CharacterSpellCardProps) {
  const { spell } = charSpell
  const [showNotes, setShowNotes] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [swiped, setSwiped] = useState(false)
  const [deltaX, setDeltaX] = useState(0)
  const togglePrepared = useTogglePrepared(characterId)

  const isPrepared = charSpell.is_prepared
  const isCantrip = spell.level === 0
  const borderColor = SCHOOL_BORDER[spell.school] ?? 'border-l-border'

  const handlers = useSwipeable({
    onSwiping: ({ deltaX: dx }) => {
      if (swiped) {
        const offset = Math.min(0, -DELETE_WIDTH + Math.max(0, dx))
        setDeltaX(offset)
      } else {
        const offset = Math.min(0, dx)
        setDeltaX(offset)
      }
    },
    onSwipedLeft: () => {
      setSwiped(true)
      setDeltaX(-DELETE_WIDTH)
    },
    onSwipedRight: () => {
      setSwiped(false)
      setDeltaX(0)
    },
    onTouchEndOrOnMouseUp: () => {
      if (!swiped && deltaX > -DELETE_WIDTH / 2) {
        setDeltaX(0)
      } else if (swiped && deltaX < -DELETE_WIDTH / 2) {
        setDeltaX(-DELETE_WIDTH)
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 10,
  })

  return (
    <>
      <div className="relative overflow-hidden rounded-lg select-none">

        {/* Pannello elimina */}
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive"
          style={{ width: DELETE_WIDTH }}
        >
          <button
            className="flex flex-col items-center gap-1 text-white"
            onClick={() => { setSwiped(false); setDeltaX(0); onRemove(charSpell.id) }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px] font-medium">Rimuovi</span>
          </button>
        </div>

        {/* Card principale */}
        <div
          className={cn(
            'relative border border-border/60 bg-card border-l-2',
            borderColor,
            isPrepared && !isCantrip && 'bg-primary/5 border-primary/50 shadow-[0_0_8px_hsl(var(--primary)/0.15)]',
          )}
          style={{
            transform: `translateX(${swiped ? -DELETE_WIDTH : deltaX}px)`,
            transition: deltaX === 0 || deltaX === -DELETE_WIDTH ? 'transform 0.2s ease' : 'none',
          }}
        >
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

            {/* Info — swipe handler solo qui, lontano dai bottoni */}
            <div
              {...handlers}
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => { if (!swiped) setShowDetail(true) }}
            >
              <p className="font-medium text-sm leading-tight truncate">{spell.name}</p>
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
                onClick={() => { if (!swiped) setShowNotes(!showNotes) }}
                title="Note personali"
              >
                {showNotes ? <ChevronUp className="h-4 w-4" /> : <Feather className="h-4 w-4" />}
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
      </div>

      <SpellDetailModal spell={showDetail ? spell : null} onClose={() => setShowDetail(false)} />
    </>
  )
}

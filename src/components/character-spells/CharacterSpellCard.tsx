import { useState, useRef, useEffect } from 'react'
import { Trash2, ChevronUp, Flame, Feather } from 'lucide-react'
import { useDrag } from '@use-gesture/react'
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
  const [offsetX, setOffsetX] = useState(0)
  const togglePrepared = useTogglePrepared(characterId)
  const isDragging = useRef(false)

  const isPrepared = charSpell.is_prepared
  const isCantrip = spell.level === 0
  const borderColor = SCHOOL_BORDER[spell.school] ?? 'border-l-border'
  const isOpen = offsetX <= -DELETE_WIDTH / 2

  const [flashClass, setFlashClass] = useState('')
  const prevPrepared = useRef(isPrepared)
  useEffect(() => {
    if (prevPrepared.current === isPrepared) return
    prevPrepared.current = isPrepared
    const cls = isPrepared ? 'animate-spell-prepare' : 'animate-spell-unprepare'
    setFlashClass(cls)
    const t = setTimeout(() => setFlashClass(''), 500)
    return () => clearTimeout(t)
  }, [isPrepared])

  const bind = useDrag(({ movement: [mx], dragging, cancel, event }) => {
    // Blocca se il touch parte su un bottone
    if ((event.target as HTMLElement).closest('button')) { cancel(); return }

    isDragging.current = !!dragging

    if (dragging) {
      const base = isOpen ? -DELETE_WIDTH : 0
      const next = Math.max(-DELETE_WIDTH, Math.min(0, base + mx))
      setOffsetX(next)
    } else {
      // Al rilascio: snap aperto o chiuso
      setOffsetX(isOpen ? -DELETE_WIDTH : 0)
    }
  }, {
    axis: 'x',
    filterTaps: true,
    rubberband: true,
    from: () => [isOpen ? -DELETE_WIDTH : 0, 0],
  })

  function onInfoClick() {
    if (isDragging.current) return
    if (isOpen) { setOffsetX(0); return }
    setShowDetail(true)
  }

  return (
    <>
      <div className={cn(
        'relative overflow-hidden rounded-lg select-none',
        isPrepared && !isCantrip && 'outline outline-2 outline-primary/60',
        flashClass,
      )}>

        {/* Pannello elimina */}
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive"
          style={{ width: DELETE_WIDTH }}
        >
          <button
            className="flex flex-col items-center gap-1 text-white"
            onClick={() => { setOffsetX(0); onRemove(charSpell.id) }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px] font-medium">Rimuovi</span>
          </button>
        </div>

        {/* Card principale */}
        <div
          {...bind()}
          className={cn(
            'relative border border-border/60 bg-card border-l-2 touch-pan-y',
            borderColor,
          )}
          style={{
            transform: `translateX(${offsetX}px)`,
            transition: isDragging.current ? 'none' : 'transform 0.2s ease',
          }}
        >
          <div className="flex items-center gap-3 px-3 py-3.5">

            {/* Livello */}
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold font-fantasy',
              isPrepared && !isCantrip
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/15 text-primary ring-1 ring-primary/30',
            )}>
              {formatLevel(spell.level)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 cursor-pointer" onClick={onInfoClick}>
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
                >
                  <Flame className={cn('h-4 w-4', isPrepared && 'fill-orange-400')} />
                </button>
              )}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all active:scale-95"
                onClick={() => { if (!isOpen) setShowNotes(!showNotes) }}
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

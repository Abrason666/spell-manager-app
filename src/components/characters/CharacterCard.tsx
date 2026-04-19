import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import { CLASS_LABELS, CLASS_ICONS, CLASS_COLORS, cn } from '@/lib/utils'
import type { Character } from '@/types'

interface CharacterCardProps {
  character: Character
  isActive: boolean
  onEdit: (character: Character) => void
  onDelete: (character: Character) => void
}

const DELETE_WIDTH = 80

export function CharacterCard({ character, isActive, onEdit, onDelete }: CharacterCardProps) {
  const navigate = useNavigate()
  const [swiped, setSwiped] = useState(false)
  const [deltaX, setDeltaX] = useState(0)

  const classColor = CLASS_COLORS[character.class] ?? 'bg-muted text-muted-foreground border-muted'
  const classIcon  = CLASS_ICONS[character.class]  ?? '🧙'

  const handlers = useSwipeable({
    onSwiping: ({ deltaX: dx }) => {
      if (swiped) {
        // già aperto: permetti di chiuderlo swipando a destra
        const offset = Math.min(0, -DELETE_WIDTH + Math.max(0, dx))
        setDeltaX(offset)
      } else {
        // chiuso: permetti di aprirlo swipando a sinistra
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
      // snap: se non ha superato la soglia, torna alla posizione corrente
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

  function onCardClick() {
    if (swiped) { setSwiped(false); setDeltaX(0); return }
    navigate(`/spellbook/${character.id}`)
  }

  return (
    <div className="group relative overflow-hidden rounded-xl select-none">

      {/* Pannello cestino */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive rounded-xl"
        style={{ width: DELETE_WIDTH }}
      >
        <button
          className="flex flex-col items-center gap-1 text-white"
          onClick={(e) => { e.stopPropagation(); setSwiped(false); setDeltaX(0); onDelete(character) }}
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Elimina</span>
        </button>
      </div>

      {/* Card principale */}
      <div
        className={cn(
          'relative bg-card border rounded-xl cursor-pointer active:brightness-95',
          isActive
            ? 'border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
            : 'border-border/60 hover:border-border',
        )}
        style={{
          transform: `translateX(${swiped ? -DELETE_WIDTH : deltaX}px)`,
          transition: deltaX === 0 || deltaX === -DELETE_WIDTH ? 'transform 0.2s ease' : 'none',
        }}
        onClick={onCardClick}
      >
        {/* Striscia colore top */}
        <div className={cn('h-1 w-full rounded-t-xl', isActive ? 'bg-primary' : 'bg-border/40')} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-4">
            {/* Zona swipe: solo info personaggio, non il bottone matita */}
            <div {...handlers} className="flex items-center gap-3 min-w-0 flex-1">
              <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl border', classColor)}>
                {classIcon}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-fantasy font-semibold text-base leading-tight">{character.name}</h3>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', classColor)}>
                    {CLASS_LABELS[character.class] ?? character.class}
                  </span>
                  <span className="text-xs text-muted-foreground">Lv. {character.level}</span>
                </div>
              </div>
            </div>

            <button
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                'border-border/60 text-muted-foreground hover:text-foreground hover:border-border',
                'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
              )}
              onClick={(e) => { e.stopPropagation(); setSwiped(false); setDeltaX(0); onEdit(character) }}
              title="Modifica personaggio"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>

          {character.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2 italic">{character.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDrag } from '@use-gesture/react'
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
  const [offsetX, setOffsetX] = useState(0)
  const isDragging = useRef(false)

  const classColor = CLASS_COLORS[character.class] ?? 'bg-muted text-muted-foreground border-muted'
  const classIcon  = CLASS_ICONS[character.class]  ?? '🧙'
  const isOpen = offsetX <= -DELETE_WIDTH / 2

  const bind = useDrag(({ movement: [mx], dragging, cancel, event }) => {
    if ((event.target as HTMLElement).closest('button')) { cancel(); return }

    isDragging.current = !!dragging

    if (dragging) {
      const base = isOpen ? -DELETE_WIDTH : 0
      const next = Math.max(-DELETE_WIDTH, Math.min(0, base + mx))
      setOffsetX(next)
    } else {
      setOffsetX(isOpen ? -DELETE_WIDTH : 0)
    }
  }, {
    axis: 'x',
    filterTaps: true,
    rubberband: true,
    from: () => [isOpen ? -DELETE_WIDTH : 0, 0],
  })

  function onCardClick() {
    if (isDragging.current) return
    if (isOpen) { setOffsetX(0); return }
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
          onClick={() => { setOffsetX(0); onDelete(character) }}
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Elimina</span>
        </button>
      </div>

      {/* Card principale */}
      <div
        {...bind()}
        className={cn(
          'relative bg-card border rounded-xl cursor-pointer active:brightness-95 touch-pan-y',
          isActive
            ? 'border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
            : 'border-border/60 hover:border-border',
        )}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s ease',
        }}
        onClick={onCardClick}
      >
        <div className={cn('h-1 w-full rounded-t-xl', isActive ? 'bg-primary' : 'bg-border/40')} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
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
              onClick={(e) => { e.stopPropagation(); setOffsetX(0); onEdit(character) }}
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

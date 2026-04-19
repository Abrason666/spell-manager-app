import { useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CLASS_LABELS, CLASS_ICONS, CLASS_COLORS, cn } from '@/lib/utils'
import type { Character } from '@/types'

interface CharacterCardProps {
  character: Character
  isActive: boolean
  onEdit: (character: Character) => void
  onDelete: (character: Character) => void
}

const DELETE_WIDTH = 80   // px largezza del pannello cestino
const SWIPE_THRESHOLD = 50 // px minimi per attivare lo swipe

export function CharacterCard({ character, isActive, onEdit, onDelete }: CharacterCardProps) {
  const navigate = useNavigate()
  const [swiped, setSwiped] = useState(false)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipe = useRef(false)

  const classColor = CLASS_COLORS[character.class] ?? 'bg-muted text-muted-foreground border-muted'
  const classIcon  = CLASS_ICONS[character.class]  ?? '🧙'

  /* ── Touch handlers ────────────────────────────────────────────────────── */
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    didSwipe.current = false
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) < Math.abs(dy)) return   // scroll verticale, ignora
    if (Math.abs(dx) < SWIPE_THRESHOLD) return

    didSwipe.current = true
    setSwiped(dx < 0)  // sinistra → apri; destra → chiudi
  }

  function onCardClick() {
    if (didSwipe.current) { didSwipe.current = false; return }
    if (swiped)            { setSwiped(false); return }
    navigate(`/spellbook/${character.id}`)
  }

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="group relative overflow-hidden rounded-xl select-none">

      {/* Pannello cestino (slide-in da destra) */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive transition-all duration-200"
        style={{ width: DELETE_WIDTH }}
      >
        <button
          className="flex flex-col items-center gap-1 text-white"
          onClick={(e) => { e.stopPropagation(); setSwiped(false); onDelete(character) }}
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Elimina</span>
        </button>
      </div>

      {/* Card principale */}
      <div
        className={cn(
          'relative bg-card border rounded-xl transition-transform duration-200 cursor-pointer active:brightness-95',
          isActive
            ? 'border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
            : 'border-border/60 hover:border-border',
          swiped ? `-translate-x-[${DELETE_WIDTH}px]` : 'translate-x-0',
        )}
        style={{ transform: swiped ? `translateX(-${DELETE_WIDTH}px)` : 'translateX(0)' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onCardClick}
      >
        {/* Striscia colore top */}
        <div className={cn('h-1 w-full rounded-t-xl', isActive ? 'bg-primary' : 'bg-border/40')} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
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

            {/* Matita — sempre visibile su mobile, hover su desktop */}
            <button
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                'border-border/60 text-muted-foreground hover:text-foreground hover:border-border',
                'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
              )}
              onClick={(e) => { e.stopPropagation(); setSwiped(false); onEdit(character) }}
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

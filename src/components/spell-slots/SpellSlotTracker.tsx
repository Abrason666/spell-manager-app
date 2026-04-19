import { Moon, Gem } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpellSlotRow } from './SpellSlotRow'
import { useLongRest } from '@/hooks/useSpellSlots'
import { Spinner } from '@/components/ui/spinner'
import { getMulticlassSlots, CLASS_LABELS, isMulticlass } from '@/lib/utils'
import type { SpellSlot, Character } from '@/types'

interface SpellSlotTrackerProps {
  slots: SpellSlot[]
  characterId: string | null
  character: Character | null
  loading: boolean
}

export function SpellSlotTracker({ slots, characterId, character, loading }: SpellSlotTrackerProps) {
  const longRest = useLongRest(characterId)

  if (loading) return <div className="flex justify-center py-6"><Spinner className="text-primary" /></div>
  if (!character) return null

  const multiclass = isMulticlass(character.class2)
  const { main: mainSlots, pact: pactSlots } = getMulticlassSlots(
    character.class, character.level,
    character.class2, character.level2,
  )

  const totalAvailable = slots.reduce((s, sl) => s + (sl.max_slots - sl.used_slots), 0)
  const totalMax       = slots.reduce((s, sl) => s + sl.max_slots, 0)


  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-primary/5">
        <div className="flex items-center gap-2">
          <Gem className="h-4 w-4 text-primary" />
          <h3 className="font-fantasy text-sm font-semibold text-primary tracking-wide">Slot Incantesimo</h3>
          {totalMax > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">{totalAvailable}/{totalMax}</span>
          )}
        </div>
        <Button
          size="sm" variant="ghost"
          className="h-9 gap-2 text-sm text-muted-foreground hover:text-primary px-3"
          onClick={() => longRest.mutate(slots)}
          disabled={longRest.isPending}
          title="Riposo lungo: recupera tutti gli slot"
        >
          <Moon className="h-5 w-5" />
          <span className="hidden sm:inline">Riposo lungo</span>
        </Button>
      </div>

      {/* Slot principali — escludi posizioni pact-only */}
      <div className="px-3 divide-y divide-border/30">
        {slots
          .filter((_, i) => !pactSlots || mainSlots[i] > 0)
          .map((slot) => (
            <SpellSlotRow key={slot.id} slot={slot} characterId={characterId} />
          ))}
      </div>

      {/* Pact Magic separata (warlock multiclasse) */}
      {multiclass && pactSlots && (character.class === 'warlock' || character.class2 === 'warlock') ? (
        <div className="border-t border-border/40 px-3 pb-1">
          <p className="pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-violet-400">
            Pact Magic — {CLASS_LABELS['warlock']}
          </p>
          <div className="divide-y divide-border/30">
            {slots
              .filter((_, i) => pactSlots[i] > 0)
              .map((slot) => (
                <SpellSlotRow key={`pact-${slot.id}`} slot={slot} characterId={characterId} />
              ))}
          </div>
        </div>
      ) : null}

      {totalMax === 0 && (
        <p className="py-3 text-xs text-center text-muted-foreground px-4">
          Premi <span className="text-primary font-medium">Sincronizza</span> per caricare gli slot
          {multiclass
            ? ` di ${CLASS_LABELS[character.class]} Lv.${character.level} / ${CLASS_LABELS[character.class2!]} Lv.${character.level2}.`
            : ` di ${CLASS_LABELS[character.class]} Lv. ${character.level}.`}
        </p>
      )}
    </div>
  )
}

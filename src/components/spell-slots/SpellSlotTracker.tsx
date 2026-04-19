import { Moon, Gem, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpellSlotRow } from './SpellSlotRow'
import { useLongRest, useSyncSlots } from '@/hooks/useSpellSlots'
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
  const longRest  = useLongRest(characterId)
  const syncSlots = useSyncSlots(characterId)

  if (loading) return <div className="flex justify-center py-6"><Spinner className="text-primary" /></div>
  if (!character) return null

  const multiclass = isMulticlass(character.class2)
  const { main: mainSlots, pact: pactSlots } = getMulticlassSlots(
    character.class, character.level,
    character.class2, character.level2,
  )

  const totalAvailable = slots.reduce((s, sl) => s + (sl.max_slots - sl.used_slots), 0)
  const totalMax       = slots.reduce((s, sl) => s + sl.max_slots, 0)

  function handleSync() {
    if (!character || !slots.length) return
    syncSlots.mutate({
      slots,
      mainArray: mainSlots,
      pactArray: pactSlots,
    })
  }

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
        <div className="flex items-center gap-1">
          <Button
            size="sm" variant="ghost"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary px-2"
            onClick={handleSync}
            disabled={syncSlots.isPending}
            title="Sincronizza slot con classe/livello"
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sincronizza</span>
          </Button>
          <Button
            size="sm" variant="ghost"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary px-2"
            onClick={() => longRest.mutate(slots)}
            disabled={longRest.isPending}
            title="Riposo lungo: recupera tutti gli slot"
          >
            <Moon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Riposo lungo</span>
          </Button>
        </div>
      </div>

      {/* Slot principali */}
      <div className="px-3 divide-y divide-border/30">
        {slots.map((slot) => (
          <SpellSlotRow key={slot.id} slot={slot} characterId={characterId} />
        ))}
      </div>

      {/* Pact Magic separata (warlock multiclasse) */}
      {multiclass && pactSlots && character.class2 === 'warlock' || multiclass && pactSlots && character.class === 'warlock' ? (
        <div className="border-t border-border/40 px-3 pb-1">
          <p className="pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-violet-400">
            Pact Magic — {CLASS_LABELS[character.class === 'warlock' ? character.class : character.class2!]}
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

import { useUseSlot, useRecoverSlot } from '@/hooks/useSpellSlots'
import { cn } from '@/lib/utils'
import type { SpellSlot } from '@/types'

interface SpellSlotRowProps {
  slot: SpellSlot
  characterId: string | null
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

export function SpellSlotRow({ slot, characterId }: SpellSlotRowProps) {
  const useSlot     = useUseSlot(characterId)
  const recoverSlot = useRecoverSlot(characterId)

  const available = slot.max_slots - slot.used_slots
  const isPending = useSlot.isPending || recoverSlot.isPending

  if (slot.max_slots === 0) return null

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Livello con numero romano */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-fantasy font-semibold">
        {ROMAN[slot.slot_level]}
      </div>

      {/* Cerchi visivi */}
      <div className="flex flex-1 flex-wrap gap-2.5 min-w-0">
        {Array.from({ length: slot.max_slots }).map((_, i) => {
          const isAvailable = i < available
          return (
            <button
              key={i}
              disabled={isPending}
              title={isAvailable ? 'Usa slot' : 'Recupera slot'}
              onClick={() =>
                isAvailable
                  ? useSlot.mutate({ slotId: slot.id, usedSlots: slot.used_slots })
                  : recoverSlot.mutate({ slotId: slot.id, usedSlots: slot.used_slots })
              }
              className={cn(
                'h-7 w-7 rounded-full border-2 transition-all duration-150 disabled:opacity-40',
                isAvailable
                  ? 'border-primary bg-primary/75 hover:bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.45)] active:scale-90'
                  : 'border-muted-foreground/30 bg-transparent hover:border-primary/40 active:scale-90',
              )}
            />
          )
        })}
      </div>

      {/* Contatore X/Y */}
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {available}/{slot.max_slots}
      </span>
    </div>
  )
}

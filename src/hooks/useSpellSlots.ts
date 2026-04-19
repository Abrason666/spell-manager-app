import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getMulticlassSlots } from '@/lib/utils'
import type { SpellSlot } from '@/types'

export function useSpellSlots(characterId: string | null) {
  return useQuery({
    queryKey: ['spell_slots', characterId],
    queryFn: async () => {
      if (!characterId) return []
      const { data, error } = await supabase
        .from('spell_slots')
        .select('*')
        .eq('character_id', characterId)
        .order('slot_level', { ascending: true })
      if (error) throw error
      return data as SpellSlot[]
    },
    enabled: !!characterId,
  })
}

export function useUpdateSlotMax(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotId, maxSlots, usedSlots }: { slotId: string; maxSlots: number; usedSlots: number }) => {
      const safeUsed = Math.min(usedSlots, maxSlots)
      const { error } = await supabase
        .from('spell_slots').update({ max_slots: maxSlots, used_slots: safeUsed }).eq('id', slotId)
      if (error) throw error
    },
    onMutate: async ({ slotId, maxSlots, usedSlots }) => {
      await qc.cancelQueries({ queryKey: ['spell_slots', characterId] })
      const prev = qc.getQueryData<SpellSlot[]>(['spell_slots', characterId])
      qc.setQueryData<SpellSlot[]>(['spell_slots', characterId], (old) =>
        old?.map((s) => s.id === slotId ? { ...s, max_slots: maxSlots, used_slots: Math.min(usedSlots, maxSlots) } : s)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['spell_slots', characterId], ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: ['spell_slots', characterId] }),
  })
}

export function useUseSlot(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotId, usedSlots }: { slotId: string; usedSlots: number }) => {
      const { error } = await supabase.from('spell_slots').update({ used_slots: usedSlots + 1 }).eq('id', slotId)
      if (error) throw error
    },
    onMutate: async ({ slotId, usedSlots }) => {
      await qc.cancelQueries({ queryKey: ['spell_slots', characterId] })
      const prev = qc.getQueryData<SpellSlot[]>(['spell_slots', characterId])
      qc.setQueryData<SpellSlot[]>(['spell_slots', characterId], (old) =>
        old?.map((s) => s.id === slotId ? { ...s, used_slots: usedSlots + 1 } : s)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['spell_slots', characterId], ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: ['spell_slots', characterId] }),
  })
}

export function useRecoverSlot(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotId, usedSlots }: { slotId: string; usedSlots: number }) => {
      const { error } = await supabase.from('spell_slots').update({ used_slots: usedSlots - 1 }).eq('id', slotId)
      if (error) throw error
    },
    onMutate: async ({ slotId, usedSlots }) => {
      await qc.cancelQueries({ queryKey: ['spell_slots', characterId] })
      const prev = qc.getQueryData<SpellSlot[]>(['spell_slots', characterId])
      qc.setQueryData<SpellSlot[]>(['spell_slots', characterId], (old) =>
        old?.map((s) => s.id === slotId ? { ...s, used_slots: usedSlots - 1 } : s)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['spell_slots', characterId], ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: ['spell_slots', characterId] }),
  })
}

export function useLongRest(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (slots: SpellSlot[]) => {
      await Promise.all(slots.map((s) =>
        supabase.from('spell_slots').update({ used_slots: 0 }).eq('id', s.id)
      ))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spell_slots', characterId] }),
  })
}

export function useSyncSlots(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      slots, mainArray, pactArray,
      // legacy: accetta ancora classKey/level per compatibilità con SpellbookPage auto-sync
      classKey, level, class2, level2,
    }: {
      slots: SpellSlot[]
      mainArray?: number[]
      pactArray?: number[] | null
      classKey?: string
      level?: number
      class2?: string | null
      level2?: number | null
    }) => {
      // Calcola gli array se non passati direttamente
      let main = mainArray
      let pact = pactArray
      if (!main && classKey && level !== undefined) {
        const result = getMulticlassSlots(classKey, level, class2, level2)
        main = result.main
        pact = result.pact
      }
      if (!main) throw new Error('Dati slot mancanti')

      await Promise.all(
        slots.map((slot, i) => {
          // Pact Magic: se c'è un array pact con valori > 0 a questo indice, usa quello
          const isPact = pact && pact[i] > 0 && main![i] === 0
          const newMax  = isPact ? pact![i] : (main![i] ?? 0)
          const newUsed = Math.min(slot.used_slots, newMax)
          return supabase.from('spell_slots')
            .update({ max_slots: newMax, used_slots: newUsed })
            .eq('id', slot.id)
        })
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spell_slots', characterId] }),
  })
}

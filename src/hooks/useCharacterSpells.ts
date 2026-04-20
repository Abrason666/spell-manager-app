import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CharacterSpell } from '@/types'

export function useCharacterSpells(characterId: string | null) {
  return useQuery({
    queryKey: ['character_spells', characterId],
    queryFn: async () => {
      if (!characterId) return []
      const { data, error } = await supabase
        .from('character_spells')
        .select('*, spell:spells(*)')
        .eq('character_id', characterId)
        .order('added_at', { ascending: true })
      if (error) throw error
      return data as CharacterSpell[]
    },
    enabled: !!characterId,
  })
}

export function useAddSpell(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (spellId: string) => {
      if (!characterId) throw new Error('No character selected')
      const { error } = await supabase
        .from('character_spells')
        .insert({ character_id: characterId, spell_id: spellId })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character_spells', characterId] }),
  })
}

export function useRemoveSpell(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (characterSpellId: string) => {
      const { error } = await supabase.from('character_spells').delete().eq('id', characterSpellId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character_spells', characterId] }),
  })
}

export function useUpdateSpellNotes(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('character_spells')
        .update({ personal_notes: notes })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character_spells', characterId] }),
  })
}

export function useTogglePrepared(characterId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isPrepared }: { id: string; isPrepared: boolean }) => {
      const { error } = await supabase
        .from('character_spells')
        .update({ is_prepared: isPrepared })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, isPrepared }) => {
      await qc.cancelQueries({ queryKey: ['character_spells', characterId] })
      const prev = qc.getQueryData(['character_spells', characterId])
      qc.setQueryData(['character_spells', characterId], (old: CharacterSpell[] | undefined) =>
        old?.map(cs => cs.id === id ? { ...cs, is_prepared: isPrepared } : cs)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx: { prev: unknown } | undefined) => {
      if (ctx?.prev) qc.setQueryData(['character_spells', characterId], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['character_spells', characterId] }),
  })
}

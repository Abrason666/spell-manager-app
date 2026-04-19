import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Character, CharacterInsert, CharacterUpdate } from '@/types'

export function useCharacters(userId: string | undefined) {
  return useQuery({
    queryKey: ['characters', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Character[]
    },
    enabled: !!userId,
  })
}

export function useCreateCharacter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<CharacterInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('characters').insert(input).select().single()
      if (error) throw error
      return data as Character
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['characters', data.user_id] })
    },
  })
}

export function useUpdateCharacter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, userId, update }: { id: string; userId: string; update: CharacterUpdate }) => {
      const { data, error } = await supabase.from('characters').update(update).eq('id', id).select().single()
      if (error) throw error
      return { data: data as Character, userId }
    },
    onSuccess: ({ userId }) => {
      qc.invalidateQueries({ queryKey: ['characters', userId] })
    },
  })
}

export function useDeleteCharacter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase.from('characters').delete().eq('id', id)
      if (error) throw error
      return userId
    },
    onSuccess: (userId) => {
      qc.invalidateQueries({ queryKey: ['characters', userId] })
    },
  })
}

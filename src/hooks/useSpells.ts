import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useFilterStore } from '@/stores/filterStore'
import type { Spell } from '@/types'

export function useSpells() {
  return useQuery({
    queryKey: ['spells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spells')
        .select('*')
        .order('level', { ascending: true })
        .order('name', { ascending: true })
      if (error) throw error
      return data as Spell[]
    },
    staleTime: Infinity,
  })
}

export function useFilteredSpells(spells: Spell[] | undefined) {
  const { searchTerm, levelFilter, schoolFilter, classFilter, concentrationOnly, ritualOnly } =
    useFilterStore()

  return useMemo(() => {
    if (!spells) return []
    return spells.filter((s) => {
      if (levelFilter !== 'all' && s.level !== levelFilter) return false
      if (schoolFilter !== 'all' && s.school !== schoolFilter) return false
      if (classFilter !== 'all' && !s.classes.includes(classFilter)) return false
      if (concentrationOnly && !s.concentration) return false
      if (ritualOnly && !s.ritual) return false
      if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
  }, [spells, searchTerm, levelFilter, schoolFilter, classFilter, concentrationOnly, ritualOnly])
}

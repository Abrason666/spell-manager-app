import { create } from 'zustand'

interface FilterState {
  searchTerm: string
  levelFilter: number | 'all'
  schoolFilter: string | 'all'
  classFilter: string | 'all'
  concentrationOnly: boolean
  ritualOnly: boolean
  setSearchTerm: (term: string) => void
  setLevelFilter: (level: number | 'all') => void
  setSchoolFilter: (school: string | 'all') => void
  setClassFilter: (cls: string | 'all') => void
  setConcentrationOnly: (v: boolean) => void
  setRitualOnly: (v: boolean) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>()((set) => ({
  searchTerm: '',
  levelFilter: 'all',
  schoolFilter: 'all',
  classFilter: 'all',
  concentrationOnly: false,
  ritualOnly: false,
  setSearchTerm: (term) => set({ searchTerm: term }),
  setLevelFilter: (level) => set({ levelFilter: level }),
  setSchoolFilter: (school) => set({ schoolFilter: school }),
  setClassFilter: (cls) => set({ classFilter: cls }),
  setConcentrationOnly: (v) => set({ concentrationOnly: v }),
  setRitualOnly: (v) => set({ ritualOnly: v }),
  resetFilters: () =>
    set({
      searchTerm: '',
      levelFilter: 'all',
      schoolFilter: 'all',
      classFilter: 'all',
      concentrationOnly: false,
      ritualOnly: false,
    }),
}))

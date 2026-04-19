import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  activeCharacterId: string | null
  setActiveCharacterId: (id: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeCharacterId: null,
      setActiveCharacterId: (id) => set({ activeCharacterId: id }),
    }),
    { name: 'ui-store' }
  )
)

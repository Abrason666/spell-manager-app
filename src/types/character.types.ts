import type { Database } from './database.types'

export type Character = Database['public']['Tables']['characters']['Row']
export type CharacterInsert = Database['public']['Tables']['characters']['Insert']
export type CharacterUpdate = Database['public']['Tables']['characters']['Update']

export type SpellSlot = Database['public']['Tables']['spell_slots']['Row']

import type { Database } from './database.types'

export type Spell = Database['public']['Tables']['spells']['Row']
export type SpellInsert = Database['public']['Tables']['spells']['Insert']

export type CharacterSpell = Database['public']['Tables']['character_spells']['Row'] & {
  spell: Spell
}

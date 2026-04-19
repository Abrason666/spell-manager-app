export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          id: string
          user_id: string
          name: string
          class: string
          level: number
          class2: string | null
          level2: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          class: string
          level?: number
          class2?: string | null
          level2?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          class?: string
          level?: number
          class2?: string | null
          level2?: number | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      spells: {
        Row: {
          id: string
          name: string
          slug: string
          level: number
          school: string
          casting_time: string
          range: string
          components: string
          concentration: boolean
          ritual: boolean
          description: string | null
          higher_levels: string | null
          duration: string | null
          classes: string[]
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          level: number
          school: string
          casting_time: string
          range: string
          components: string
          concentration?: boolean
          ritual?: boolean
          description?: string | null
          higher_levels?: string | null
          duration?: string | null
          classes?: string[]
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          level?: number
          school?: string
          casting_time?: string
          range?: string
          components?: string
          concentration?: boolean
          ritual?: boolean
          description?: string | null
          higher_levels?: string | null
          duration?: string | null
          classes?: string[]
          source?: string | null
        }
        Relationships: []
      }
      character_spells: {
        Row: {
          id: string
          character_id: string
          spell_id: string
          personal_notes: string | null
          is_prepared: boolean
          added_at: string
        }
        Insert: {
          id?: string
          character_id: string
          spell_id: string
          personal_notes?: string | null
          is_prepared?: boolean
          added_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          spell_id?: string
          personal_notes?: string | null
          is_prepared?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "character_spells_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_spells_spell_id_fkey"
            columns: ["spell_id"]
            isOneToOne: false
            referencedRelation: "spells"
            referencedColumns: ["id"]
          }
        ]
      }
      spell_slots: {
        Row: {
          id: string
          character_id: string
          slot_level: number
          max_slots: number
          used_slots: number
          updated_at: string
        }
        Insert: {
          id?: string
          character_id: string
          slot_level: number
          max_slots?: number
          used_slots?: number
          updated_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          slot_level?: number
          max_slots?: number
          used_slots?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spell_slots_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

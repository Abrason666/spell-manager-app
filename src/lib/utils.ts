import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SPELL_SCHOOLS = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
  'Evocation', 'Illusion', 'Necromancy', 'Transmutation',
] as const

export const SPELL_CLASSES = [
  'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
] as const

export const CLASS_LABELS: Record<string, string> = {
  bard: 'Bardo', cleric: 'Chierico', druid: 'Druido', paladin: 'Paladino',
  ranger: 'Ranger', sorcerer: 'Stregone', warlock: 'Warlock', wizard: 'Mago',
}

export const CLASS_ICONS: Record<string, string> = {
  bard: '🎵', cleric: '✨', druid: '🌿', paladin: '⚔️',
  ranger: '🏹', sorcerer: '🔥', warlock: '👁️', wizard: '🔮',
}

export const CLASS_COLORS: Record<string, string> = {
  bard:     'bg-pink-500/15 text-pink-300 border-pink-500/30',
  cleric:   'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  druid:    'bg-green-500/15 text-green-300 border-green-500/30',
  paladin:  'bg-amber-500/15 text-amber-300 border-amber-500/30',
  ranger:   'bg-teal-500/15 text-teal-300 border-teal-500/30',
  sorcerer: 'bg-red-500/15 text-red-300 border-red-500/30',
  warlock:  'bg-violet-500/15 text-violet-300 border-violet-500/30',
  wizard:   'bg-blue-500/15 text-blue-300 border-blue-500/30',
}

export const SCHOOL_COLORS: Record<string, string> = {
  Abjuration:    'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  Conjuration:   'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  Divination:    'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
  Enchantment:   'bg-rose-500/15 text-rose-300 border border-rose-500/25',
  Evocation:     'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  Illusion:      'bg-purple-500/15 text-purple-300 border border-purple-500/25',
  Necromancy:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  Transmutation: 'bg-teal-500/15 text-teal-300 border border-teal-500/25',
}

export const SCHOOL_BORDER: Record<string, string> = {
  Abjuration:    'border-l-blue-500',
  Conjuration:   'border-l-amber-500',
  Divination:    'border-l-cyan-500',
  Enchantment:   'border-l-rose-500',
  Evocation:     'border-l-orange-500',
  Illusion:      'border-l-purple-500',
  Necromancy:    'border-l-emerald-500',
  Transmutation: 'border-l-teal-500',
}

export function formatLevel(level: number): string {
  return level === 0 ? 'T' : String(level)
}

export function formatLevelLabel(level: number): string {
  return level === 0 ? 'Trucchetto' : `Livello ${level}`
}

// ── Slot incantesimo per classe/livello (5e 2024 PHB) ─────────────────────
// Array di 9 valori: [slot_lv1, slot_lv2, ..., slot_lv9]

const FULL_CASTER: Record<number, number[]> = {
  1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6:  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8:  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9:  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
}

// Paladin e Ranger: half-caster, max slot 5° livello.
// In 2024 PHB entrambi ottengono slot già al livello 1 del pg.
const HALF_CASTER: Record<number, number[]> = {
  1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  6:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  8:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  9:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  20: [4, 3, 3, 3, 2, 0, 0, 0, 0],
}

// Warlock: Pact Magic — tutti gli slot sono dello stesso livello (sale col pg).
// Si recuperano con Short Rest. I livelli 6-9 (Mystic Arcanum) non sono slot.
const WARLOCK_PACT_MAGIC: Record<number, number[]> = {
  1:  [1, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [0, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [0, 2, 0, 0, 0, 0, 0, 0, 0],
  5:  [0, 0, 2, 0, 0, 0, 0, 0, 0],
  6:  [0, 0, 2, 0, 0, 0, 0, 0, 0],
  7:  [0, 0, 2, 0, 0, 0, 0, 0, 0],
  8:  [0, 0, 2, 0, 0, 0, 0, 0, 0],
  9:  [0, 0, 0, 3, 0, 0, 0, 0, 0],
  10: [0, 0, 0, 3, 0, 0, 0, 0, 0],
  11: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  12: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  13: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  14: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  15: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  16: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  17: [0, 0, 0, 0, 4, 0, 0, 0, 0],
  18: [0, 0, 0, 0, 4, 0, 0, 0, 0],
  19: [0, 0, 0, 0, 4, 0, 0, 0, 0],
  20: [0, 0, 0, 0, 4, 0, 0, 0, 0],
}

export const SPELL_SLOTS_TABLE: Record<string, Record<number, number[]>> = {
  bard:     FULL_CASTER,
  cleric:   FULL_CASTER,
  druid:    FULL_CASTER,
  paladin:  HALF_CASTER,
  ranger:   HALF_CASTER,
  sorcerer: FULL_CASTER,
  warlock:  WARLOCK_PACT_MAGIC,
  wizard:   FULL_CASTER,
}

// ── Multiclasse ────────────────────────────────────────────────────────────

// Contributo al caster level combinato (warlock = 0, tiene slot separati)
function multiclassCasterLevel(cls: string, level: number): number {
  if (['bard', 'cleric', 'druid', 'sorcerer', 'wizard'].includes(cls)) return level
  if (['paladin', 'ranger'].includes(cls)) return Math.ceil(level / 2)
  return 0 // warlock e non-caster non contribuiscono al pool condiviso
}

/**
 * Restituisce gli slot per un personaggio, gestendo anche il multiclasse.
 * main  = pool slot standard (combinato per full/half caster)
 * pact  = Pact Magic warlock separato (null se non c'è warlock)
 */
export function getMulticlassSlots(
  cls1: string, lv1: number,
  cls2: string | null | undefined, lv2: number | null | undefined,
): { main: number[]; pact: number[] | null } {
  const empty = (): number[] => Array(9).fill(0)

  if (!cls2 || !lv2) {
    // Singola classe
    return { main: SPELL_SLOTS_TABLE[cls1]?.[lv1] ?? empty(), pact: null }
  }

  const w1 = cls1 === 'warlock'
  const w2 = cls2 === 'warlock'

  if (!w1 && !w2) {
    // Entrambe non-warlock: combina caster level → tabella full-caster
    const combined = Math.min(20, multiclassCasterLevel(cls1, lv1) + multiclassCasterLevel(cls2, lv2))
    return { main: FULL_CASTER[combined] ?? empty(), pact: null }
  }

  if (w1 && !w2) {
    return {
      main: SPELL_SLOTS_TABLE[cls2]?.[lv2] ?? empty(),
      pact: WARLOCK_PACT_MAGIC[lv1] ?? empty(),
    }
  }

  if (!w1 && w2) {
    return {
      main: SPELL_SLOTS_TABLE[cls1]?.[lv1] ?? empty(),
      pact: WARLOCK_PACT_MAGIC[lv2] ?? empty(),
    }
  }

  return { main: empty(), pact: null }
}

/** True se il personaggio ha una seconda classe impostata */
export function isMulticlass(cls2: string | null | undefined): cls2 is string {
  return !!cls2
}

// ── Max spell preparabili per classe ──────────────────────────────────────────
// Classi con preparazione: Cleric (SAG), Druid (SAG), Wizard (INT),
// Paladin (CAR, mezzo livello), Ranger (SAG, mezzo livello).
// Bard/Sorcerer/Warlock = incantesimi noti, nessuna preparazione.

const PREP_MOD: Record<string, { mod: string; half: boolean } | null> = {
  cleric:   { mod: 'SAG', half: false },
  druid:    { mod: 'SAG', half: false },
  wizard:   { mod: 'INT', half: false },
  paladin:  { mod: 'CAR', half: true },
  ranger:   { mod: 'SAG', half: true },
  bard:     null,
  sorcerer: null,
  warlock:  null,
}

/**
 * Restituisce la formula testuale del massimo di spell preparabili,
 * es. "SAG + 5" per un Druid 5. Null per classi senza preparazione.
 */
export function getMaxPreparedFormula(cls: string, level: number): string | null {
  const entry = PREP_MOD[cls]
  if (!entry) return null
  const lv = entry.half ? Math.floor(level / 2) : level
  return `${entry.mod} + ${lv}`
}

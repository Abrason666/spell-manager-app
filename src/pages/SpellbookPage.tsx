import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, Wand2, ChevronLeft, Swords, Sword, Flame, UserCog } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SpellSearchBar } from '@/components/spells/SpellSearchBar'
import { SpellFilters } from '@/components/spells/SpellFilters'
import { SpellList } from '@/components/spells/SpellList'
import { CharacterSpellList } from '@/components/character-spells/CharacterSpellList'
import { SessioneSpellCard } from '@/components/character-spells/SessioneSpellCard'
import { SpellSlotTracker } from '@/components/spell-slots/SpellSlotTracker'
import { CharacterSettingsPanel } from '@/components/characters/CharacterSettingsPanel'
import { useSpells, useFilteredSpells } from '@/hooks/useSpells'
import { useCharacterSpells, useAddSpell, useRemoveSpell } from '@/hooks/useCharacterSpells'
import { useSpellSlots, useSyncSlots } from '@/hooks/useSpellSlots'
import { useCharacters, useUpdateCharacter } from '@/hooks/useCharacters'
import { useUIStore } from '@/stores/uiStore'
import { useFilterStore } from '@/stores/filterStore'
import { useAuth } from '@/hooks/useAuth'
import { isMulticlass, CLASS_ICONS, cn } from '@/lib/utils'
import { ClassChipSwitcher } from '@/components/ui/ClassChipSwitcher'
import type { ClassFilter } from '@/components/ui/ClassChipSwitcher'
import type { Spell } from '@/types'

type MobileTab = 'sessione' | 'libro' | 'cerca' | 'personaggio'

const MOBILE_TABS = [
  { id: 'sessione'   as MobileTab, label: 'Sessione',   icon: Sword },
  { id: 'libro'      as MobileTab, label: 'Libro',      icon: BookOpen },
  { id: 'cerca'      as MobileTab, label: 'Cerca',      icon: Wand2 },
  { id: 'personaggio' as MobileTab, label: 'PG',        icon: UserCog },
]

export function SpellbookPage() {
  const { charId } = useParams<{ charId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeCharacterId, setActiveCharacterId } = useUIStore()
  const { classFilter, setClassFilter, resetFilters } = useFilterStore()
  const [mobileTab, setMobileTab] = useState<MobileTab>('sessione')
  const [classChip, setClassChip] = useState<ClassFilter>('all')

  useEffect(() => {
    if (charId && charId !== activeCharacterId) setActiveCharacterId(charId)
  }, [charId, activeCharacterId, setActiveCharacterId])

  const currentCharId = charId ?? activeCharacterId

  const { data: characters = [] } = useCharacters(user?.id)
  const currentCharacter = characters.find(c => c.id === currentCharId) ?? null

  // Auto-imposta il filtro classe del panel Cerca in base alla classe del pg
  useEffect(() => {
    if (currentCharacter?.class) setClassFilter(currentCharacter.class)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCharacter?.id])

  const { data: allSpells = [], isLoading: spellsLoading } = useSpells()
  const filteredSpells = useFilteredSpells(allSpells)
  const { data: charSpells = [], isLoading: charSpellsLoading } = useCharacterSpells(currentCharId)
  const { data: slots = [], isLoading: slotsLoading } = useSpellSlots(currentCharId)

  const addSpell = useAddSpell(currentCharId)
  const removeSpell = useRemoveSpell(currentCharId)
  const syncSlots = useSyncSlots(currentCharId)
  const updateCharacter = useUpdateCharacter()

  // Reset chip quando si cambia personaggio
  useEffect(() => { setClassChip('all') }, [currentCharId])

  // Auto-sync slot al primo accesso se tutti gli slot a 0
  useEffect(() => {
    if (!currentCharacter || slots.length === 0 || slotsLoading) return
    if (slots.every(s => s.max_slots === 0)) {
      syncSlots.mutate({
        slots,
        classKey: currentCharacter.class,
        level: currentCharacter.level,
        class2: currentCharacter.class2,
        level2: currentCharacter.level2,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCharacter?.id, slotsLoading])

  const spellIdsInList = useMemo(() => new Set(charSpells.map(cs => cs.spell_id)), [charSpells])

  const multi = isMulticlass(currentCharacter?.class2)

  const filteredCharSpells = useMemo(() => {
    if (!multi || classChip === 'all') return charSpells
    const cls = classChip === 'class1' ? currentCharacter?.class : currentCharacter?.class2
    if (!cls) return charSpells
    return charSpells.filter(cs => cs.spell.classes.includes(cls))
  }, [charSpells, classChip, multi, currentCharacter])

  const castableLevels = useMemo(() => {
    const available = new Set<number>([0])
    for (const slot of slots) {
      if (slot.max_slots - slot.used_slots > 0) {
        for (let l = 1; l <= slot.slot_level; l++) available.add(l)
      }
    }
    return available
  }, [slots])

  // Filtra per chip di classe
  function matchesClassChip(spellClasses: string[]): boolean {
    if (!multi || classChip === 'all') return true
    const cls = classChip === 'class1' ? currentCharacter!.class : currentCharacter!.class2!
    return spellClasses.includes(cls)
  }

  // Spell preparati = cantrip (sempre disponibili) + spell con is_prepared=true
  const sessioneSpells = useMemo(
    () => charSpells.filter(cs => (cs.spell.level === 0 || cs.is_prepared) && matchesClassChip(cs.spell.classes)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [charSpells, classChip, multi]
  )
  const preparedCount = useMemo(
    () => charSpells.filter(cs => cs.spell.level > 0 && cs.is_prepared).length,
    [charSpells]
  )

  function handleAdd(spell: Spell) {
    if (!currentCharId) return
    addSpell.mutate(spell.id)
  }

  async function handleSaveCharacter(data: {
    name: string; class: string; level: number
    class2: string | null; level2: number | null; notes: string
  }) {
    if (!currentCharId || !user) return
    await updateCharacter.mutateAsync({ id: currentCharId, userId: user.id, update: data })
    // Risincronizza slot se cambiano classe/livello
    if (slots.length > 0) {
      syncSlots.mutate({ slots, classKey: data.class, level: data.level, class2: data.class2, level2: data.level2 })
    }
    // Aggiorna filtro cerca: se multiclasse setta 'all', altrimenti la classe
    if (data.class2) {
      resetFilters()
    } else {
      setClassFilter(data.class)
    }
    setClassChip('all')
  }

  if (!currentCharId) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <BookOpen className="h-9 w-9 text-primary/50" />
          </div>
          <div>
            <h2 className="font-fantasy text-xl font-semibold">Nessun personaggio selezionato</h2>
            <p className="text-muted-foreground text-sm mt-1">Seleziona un personaggio per aprire il libro degli incantesimi.</p>
          </div>
          <button className="text-sm text-primary hover:underline flex items-center gap-1.5" onClick={() => navigate('/characters')}>
            <Swords className="h-4 w-4" />Vai ai personaggi
          </button>
        </div>
      </AppLayout>
    )
  }

  /* ── Pannelli ─────────────────────────────────────────────────────────── */

  const sessionePanel = (
    <div className="flex flex-col gap-4">
      {/* Chip switcher multiclasse */}
      {multi && currentCharacter?.class2 && (
        <ClassChipSwitcher
          cls1={currentCharacter.class}
          cls2={currentCharacter.class2}
          value={classChip}
          onChange={setClassChip}
        />
      )}
      <SpellSlotTracker
        slots={slots}
        characterId={currentCharId}
        character={currentCharacter}
        loading={slotsLoading}
      />
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Flame className="h-3 w-3 fill-orange-400 text-orange-400" />
          Preparati ({preparedCount}) + Trucchetti
        </p>
        {charSpellsLoading ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">Caricamento...</div>
        ) : sessioneSpells.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 text-muted-foreground">
            <Flame className="h-7 w-7 opacity-20" />
            <div className="text-center">
              <p className="text-sm">Nessun incantesimo preparato</p>
              <p className="text-xs mt-0.5 opacity-70">Apri il Libro e tocca 🔥 per preparare</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(
              sessioneSpells
                .sort((a, b) => a.spell.level - b.spell.level || a.spell.name.localeCompare(b.spell.name))
                .reduce((acc, cs) => {
                  const k = cs.spell.level === 0 ? 'Trucchetti' : `Livello ${cs.spell.level}`
                  if (!acc[k]) acc[k] = []
                  acc[k].push(cs)
                  return acc
                }, {} as Record<string, typeof sessioneSpells>)
            ).map(([label, group]) => (
              <div key={label}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {label} ({group.length})
                </p>
                <div className="space-y-2">
                  {group.map(cs => {
                    let dot: string | undefined
                    if (multi && classChip === 'all' && currentCharacter?.class2) {
                      const inCls1 = cs.spell.classes.includes(currentCharacter.class)
                      const inCls2 = cs.spell.classes.includes(currentCharacter.class2)
                      if (inCls1 && !inCls2) dot = CLASS_ICONS[currentCharacter.class]
                      else if (inCls2 && !inCls1) dot = CLASS_ICONS[currentCharacter.class2]
                    }
                    return <SessioneSpellCard key={cs.id} charSpell={cs} canCast={castableLevels.has(cs.spell.level)} classDot={dot} />
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const libroPanel = (
    <div className="flex flex-col gap-3">
      {multi && currentCharacter?.class2 && (
        <ClassChipSwitcher
          cls1={currentCharacter.class}
          cls2={currentCharacter.class2}
          value={classChip}
          onChange={setClassChip}
        />
      )}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Libro degli Incantesimi ({filteredCharSpells.length})
      </p>
      <CharacterSpellList
        charSpells={filteredCharSpells}
        characterId={currentCharId}
        loading={charSpellsLoading}
        onRemove={(id) => removeSpell.mutate(id)}
      />
    </div>
  )

  // Chip cerca: derivato da classFilter per restare in sync col select avanzato
  const cercaChip: ClassFilter =
    classFilter === currentCharacter?.class  ? 'class1' :
    classFilter === currentCharacter?.class2 ? 'class2' : 'all'

  function handleCercaChip(v: ClassFilter) {
    if (v === 'all')    setClassFilter('all')
    else if (v === 'class1') setClassFilter(currentCharacter!.class)
    else                setClassFilter(currentCharacter!.class2!)
  }

  function handleResetFilters() {
    resetFilters()
    if (multi) return
    if (currentCharacter?.class) setClassFilter(currentCharacter.class)
  }

  const cercaPanel = (
    <div className="flex flex-col gap-3">
      <SpellSearchBar />
      {multi && currentCharacter?.class2 && (
        <ClassChipSwitcher
          cls1={currentCharacter.class}
          cls2={currentCharacter.class2}
          value={cercaChip}
          onChange={handleCercaChip}
        />
      )}
      <SpellFilters onReset={handleResetFilters} />
      <p className="text-xs text-muted-foreground px-0.5">{filteredSpells.length} incantesimi trovati</p>
      <SpellList
        spells={filteredSpells}
        spellIdsInList={spellIdsInList}
        loading={spellsLoading}
        onAdd={handleAdd}
      />
    </div>
  )

  const personaggioPanel = currentCharacter ? (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Impostazioni personaggio
      </p>
      <CharacterSettingsPanel character={currentCharacter} onSave={handleSaveCharacter} />
    </div>
  ) : null

  /* ── Desktop: 2 colonne; Mobile: 4 tab ───────────────────────────────── */
  return (
    <AppLayout>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          onClick={() => navigate('/characters')}
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <Swords className="h-3.5 w-3.5" />
          <span>Personaggi</span>
        </button>
        {currentCharacter && (
          <>
            <span className="text-border/80">/</span>
            <span className="text-sm font-medium truncate">{currentCharacter.name}</span>
          </>
        )}
      </div>

      {/* Desktop: 3 colonne */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_320px] lg:gap-6 lg:max-w-[1600px] lg:mx-auto">
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] pr-1 space-y-6">
          {sessionePanel}
          <div className="border-t border-border/40 pt-4">{libroPanel}</div>
        </div>
        <div>{cercaPanel}</div>
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] pr-1">{personaggioPanel}</div>
      </div>

      {/* Mobile: pannelli */}
      <div className="lg:hidden pb-20">
        <div className={mobileTab === 'sessione'    ? 'block' : 'hidden'}>{sessionePanel}</div>
        <div className={mobileTab === 'libro'       ? 'block' : 'hidden'}>{libroPanel}</div>
        <div className={mobileTab === 'cerca'       ? 'block' : 'hidden'}>{cercaPanel}</div>
        <div className={mobileTab === 'personaggio' ? 'block' : 'hidden'}>{personaggioPanel}</div>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/60 bg-background/97 backdrop-blur-md">
        <div className="flex">
          {MOBILE_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = mobileTab === id
            const badge =
              id === 'sessione'    ? preparedCount :
              id === 'libro'       ? charSpells.length :
              id === 'cerca'       ? filteredSpells.length :
              null
            return (
              <button
                key={id}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition-colors relative',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
                onClick={() => setMobileTab(id)}
              >
                {/* Indicatore attivo */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{label}</span>
                {badge !== null && (
                  <span className={cn('text-[10px] tabular-nums', isActive ? 'text-primary/70' : 'text-muted-foreground/50')}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

    </AppLayout>
  )
}

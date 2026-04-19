import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFilterStore } from '@/stores/filterStore'
import { SPELL_SCHOOLS, SPELL_CLASSES, CLASS_LABELS, cn } from '@/lib/utils'
import { RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react'

interface SpellFiltersProps {
  onReset?: () => void
}

export function SpellFilters({ onReset }: SpellFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const {
    levelFilter, schoolFilter, classFilter, concentrationOnly, ritualOnly,
    setLevelFilter, setSchoolFilter, setClassFilter, setConcentrationOnly, setRitualOnly,
    resetFilters,
  } = useFilterStore()

  const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const levelLabels: Record<number, string> = {
    0: 'Truc.', 1: '1°', 2: '2°', 3: '3°', 4: '4°',
    5: '5°', 6: '6°', 7: '7°', 8: '8°', 9: '9°',
  }

  const hasAdvancedFilters = schoolFilter !== 'all' || classFilter !== 'all' || concentrationOnly || ritualOnly
  const hasAnyFilter = levelFilter !== 'all' || hasAdvancedFilters

  function handleReset() {
    onReset ? onReset() : resetFilters()
  }

  return (
    <div className="space-y-2.5">

      {/* Riga livelli */}
      <div className="flex flex-wrap gap-1.5">
        <button
          className={cn(
            'h-8 px-3 rounded-lg text-xs font-semibold transition-all border',
            levelFilter === 'all'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'border-border/70 text-muted-foreground hover:text-foreground hover:border-border bg-card',
          )}
          onClick={() => setLevelFilter('all')}
        >
          Tutti
        </button>

        {levels.map((l) => (
          <button
            key={l}
            className={cn(
              'h-8 px-2.5 rounded-lg text-xs font-semibold transition-all border min-w-[2.5rem]',
              levelFilter === l
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-border/70 text-muted-foreground hover:text-foreground hover:border-border bg-card',
            )}
            onClick={() => setLevelFilter(l)}
          >
            {levelLabels[l]}
          </button>
        ))}
      </div>

      {/* Riga azioni: Filtri + Reset */}
      <div className="flex items-center gap-2">
        <button
          className={cn(
            'h-9 px-4 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 flex-1 justify-center',
            showAdvanced
              ? 'bg-primary/20 border-primary/50 text-primary'
              : hasAdvancedFilters
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border/70 text-muted-foreground hover:text-foreground hover:border-border bg-card',
          )}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtri avanzati
          {hasAdvancedFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200 ml-auto', showAdvanced && 'rotate-180')} />
        </button>

        {hasAnyFilter && (
          <button
            className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-border/70 bg-card text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"
            onClick={handleReset}
            title="Reset filtri"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Pannello filtri avanzati */}
      {showAdvanced && (
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Select
              value={String(schoolFilter)}
              onValueChange={(v) => setSchoolFilter(v === 'all' ? 'all' : v)}
            >
              <SelectTrigger className="w-44 h-9 text-sm border-border/70 bg-background">
                <SelectValue placeholder="Scuola di magia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le scuole</SelectItem>
                {SPELL_SCHOOLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select
              value={String(classFilter)}
              onValueChange={(v) => setClassFilter(v === 'all' ? 'all' : v)}
            >
              <SelectTrigger className="w-40 h-9 text-sm border-border/70 bg-background">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le classi</SelectItem>
                {SPELL_CLASSES.map((c) => <SelectItem key={c} value={c}>{CLASS_LABELS[c]}</SelectItem>)}
              </SelectContent>
            </Select>

            <button
              className={cn(
                'h-9 px-4 rounded-lg text-sm font-medium transition-all border',
                concentrationOnly
                  ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
                  : 'border-border/70 bg-background text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setConcentrationOnly(!concentrationOnly)}
            >
              Concentrazione
            </button>

            <button
              className={cn(
                'h-9 px-4 rounded-lg text-sm font-medium transition-all border',
                ritualOnly
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                  : 'border-border/70 bg-background text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setRitualOnly(!ritualOnly)}
            >
              Rituale
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

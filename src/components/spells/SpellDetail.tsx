import { SCHOOL_COLORS, formatLevelLabel, cn } from '@/lib/utils'
import type { Spell } from '@/types'

interface SpellDetailProps {
  spell: Spell
}

export function SpellDetail({ spell }: SpellDetailProps) {
  return (
    <div className="space-y-4">
      {/* Badge scuola + livello + tag */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border', SCHOOL_COLORS[spell.school] ?? 'bg-muted text-muted-foreground')}>
          {spell.school}
        </span>
        <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border border-border/60 text-muted-foreground">
          {formatLevelLabel(spell.level)}
        </span>
        {spell.concentration && (
          <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-yellow-400/10 text-yellow-300 border border-yellow-400/25">
            Concentrazione
          </span>
        )}
        {spell.ritual && (
          <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-purple-400/10 text-purple-300 border border-purple-400/25">
            Rituale
          </span>
        )}
      </div>

      {/* Statistiche */}
      <dl className="grid grid-cols-2 gap-3">
        {[
          { label: 'Tempo di lancio', value: spell.casting_time },
          { label: 'Gittata', value: spell.range },
          { label: 'Componenti', value: spell.components },
          ...(spell.duration ? [{ label: 'Durata', value: spell.duration }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-muted/50 border border-border/40 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Descrizione */}
      {spell.description ? (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Descrizione</h4>
          <div className="text-sm text-foreground/80 space-y-2 leading-relaxed">
            {spell.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Descrizione non disponibile per questo incantesimo.</p>
      )}

      {/* A livelli superiori */}
      {spell.higher_levels && (
        <div className="rounded-lg bg-primary/8 border border-primary/20 p-3 space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">A livelli superiori</h4>
          <p className="text-sm text-foreground/80">{spell.higher_levels}</p>
        </div>
      )}
    </div>
  )
}

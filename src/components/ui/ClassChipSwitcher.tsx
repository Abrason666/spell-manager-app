import { CLASS_ICONS, CLASS_LABELS, CLASS_COLORS, cn } from '@/lib/utils'

export type ClassFilter = 'all' | 'class1' | 'class2'

interface ClassChipSwitcherProps {
  cls1: string
  cls2: string
  value: ClassFilter
  onChange: (v: ClassFilter) => void
}

export function ClassChipSwitcher({ cls1, cls2, value, onChange }: ClassChipSwitcherProps) {
  const chips: { id: ClassFilter; label: string; icon?: string; color?: string }[] = [
    { id: 'all',    label: 'Tutto' },
    { id: 'class1', label: CLASS_LABELS[cls1] ?? cls1, icon: CLASS_ICONS[cls1], color: CLASS_COLORS[cls1] },
    { id: 'class2', label: CLASS_LABELS[cls2] ?? cls2, icon: CLASS_ICONS[cls2], color: CLASS_COLORS[cls2] },
  ]

  return (
    <div className="flex gap-1.5">
      {chips.map(({ id, label, icon, color }) => {
        const active = value === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold border transition-all',
              active
                ? (color ?? 'bg-primary/15 border-primary/40 text-primary')
                : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border bg-card',
              active && color,
            )}
          >
            {icon && <span className="text-sm leading-none">{icon}</span>}
            {label}
          </button>
        )
      })}
    </div>
  )
}

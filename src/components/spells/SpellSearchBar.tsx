import { useEffect, useState } from 'react'
import { Wand2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useFilterStore } from '@/stores/filterStore'

export function SpellSearchBar() {
  const { searchTerm, setSearchTerm } = useFilterStore()
  const [local, setLocal] = useState(searchTerm)

  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(local), 300)
    return () => clearTimeout(id)
  }, [local, setSearchTerm])

  return (
    <div className="relative">
      <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        className="pl-9 pr-9 h-11 text-sm bg-card border-border/60 focus:border-primary/60"
        placeholder="Cerca incantesimo..."
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
      {local && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
          onClick={() => { setLocal(''); setSearchTerm('') }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

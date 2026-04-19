import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateSpellNotes } from '@/hooks/useCharacterSpells'

interface SpellNotesEditorProps {
  characterSpellId: string
  characterId: string | null
  initialNotes: string | null
}

export function SpellNotesEditor({ characterSpellId, characterId, initialNotes }: SpellNotesEditorProps) {
  const [value, setValue] = useState(initialNotes ?? '')
  const updateNotes = useUpdateSpellNotes(characterId)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(initialNotes ?? '')
  }, [initialNotes])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value
    setValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateNotes.mutate({ id: characterSpellId, notes: next })
    }, 1000)
  }

  return (
    <Textarea
      className="mt-2 text-xs min-h-[60px] resize-none"
      placeholder="Note personali su questo incantesimo..."
      value={value}
      onChange={handleChange}
    />
  )
}

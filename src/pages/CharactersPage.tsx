import { useState } from 'react'
import { Plus, Sword } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CharacterCard } from '@/components/characters/CharacterCard'
import { CharacterFormModal } from '@/components/characters/CharacterFormModal'
import type { CharacterFormData } from '@/components/characters/CharacterFormModal'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import { useCharacters, useCreateCharacter, useUpdateCharacter, useDeleteCharacter } from '@/hooks/useCharacters'
import { useUIStore } from '@/stores/uiStore'
import { Spinner } from '@/components/ui/spinner'
import type { Character } from '@/types'

export function CharactersPage() {
  const { user } = useAuth()
  const { data: characters = [], isLoading } = useCharacters(user?.id)
  const createCharacter = useCreateCharacter()
  const updateCharacter = useUpdateCharacter()
  const deleteCharacter = useDeleteCharacter()
  const { activeCharacterId, setActiveCharacterId } = useUIStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)

  async function handleSave(data: CharacterFormData) {
    if (editingCharacter) {
      await updateCharacter.mutateAsync({ id: editingCharacter.id, userId: user!.id, update: data })
    } else {
      const newChar = await createCharacter.mutateAsync({ ...data, user_id: user!.id })
      setActiveCharacterId(newChar.id)
    }
  }

  function handleEdit(character: Character) {
    setEditingCharacter(character)
    setModalOpen(true)
  }

  function handleDelete(character: Character) {
    if (!confirm(`Eliminare ${character.name}? Tutti gli incantesimi e slot verranno persi.`)) return
    deleteCharacter.mutate({ id: character.id, userId: user!.id })
    if (activeCharacterId === character.id) setActiveCharacterId(null)
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        {/* Header pagina */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-fantasy text-2xl font-bold text-primary">I miei personaggi</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {characters.length === 0 ? 'Nessun personaggio ancora' : `${characters.length} ${characters.length === 1 ? 'personaggio' : 'personaggi'}`}
            </p>
          </div>
          <Button
            className="gap-2 bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25"
            variant="ghost"
            onClick={() => { setEditingCharacter(null); setModalOpen(true) }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo personaggio</span>
            <span className="sm:hidden">Nuovo</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-primary" /></div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Sword className="h-9 w-9 text-primary/60" />
            </div>
            <div>
              <h2 className="font-fantasy text-xl font-semibold">Nessun personaggio</h2>
              <p className="text-muted-foreground text-sm mt-1">Crea il tuo primo eroe per iniziare a gestire gli incantesimi.</p>
            </div>
            <Button
              className="gap-2 bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25"
              variant="ghost"
              onClick={() => { setEditingCharacter(null); setModalOpen(true) }}
            >
              <Plus className="h-4 w-4" />
              Crea personaggio
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((c) => (
              <CharacterCard
                key={c.id}
                character={c}
                isActive={activeCharacterId === c.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <CharacterFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingCharacter}
      />
    </AppLayout>
  )
}

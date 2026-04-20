import { LogOut, Swords, Sword } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCharacters } from '@/hooks/useCharacters'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { CLASS_LABELS, CLASS_ICONS } from '@/lib/utils'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { data: characters = [] } = useCharacters(user?.id)
  const { activeCharacterId } = useUIStore()

  const onSpellbook = location.pathname.startsWith('/spellbook')
  const activeChar = characters.find(c => c.id === activeCharacterId) ?? null

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 gap-3 max-w-[1600px] mx-auto">

        {/* Logo */}
        <button
          className="flex items-center gap-2 shrink-0 group"
          onClick={() => navigate(activeCharacterId ? `/spellbook/${activeCharacterId}` : '/characters')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/30 group-hover:bg-primary/25 transition-colors">
            <Sword className="h-4 w-4 text-primary" />
          </div>
          <span className="font-fantasy font-semibold text-sm text-primary hidden sm:block tracking-wide">
            Spell Manager
          </span>
        </button>

        {/* Titolo personaggio attivo */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          {onSpellbook && activeChar ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg leading-none">{CLASS_ICONS[activeChar.class] ?? '🧙'}</span>
              <p className="font-fantasy font-semibold text-sm text-foreground truncate">
                {activeChar.name}
              </p>
              <span className="hidden sm:block text-xs text-muted-foreground shrink-0">
                — {CLASS_LABELS[activeChar.class] ?? activeChar.class} Lv. {activeChar.level}
                {activeChar.class2 && activeChar.level2
                  ? ` / ${CLASS_LABELS[activeChar.class2] ?? activeChar.class2} Lv. ${activeChar.level2}`
                  : ''}
              </span>
              <span className="sm:hidden text-xs text-muted-foreground shrink-0">
                Lv. {activeChar.level}{activeChar.class2 && activeChar.level2 ? `+${activeChar.level2}` : ''}
              </span>
            </div>
          ) : null}
        </div>

        {/* Azioni destra */}
        <div className="flex items-center gap-1 shrink-0">
          {!onSpellbook && (
            <button
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border/60 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              onClick={() => navigate('/characters')}
            >
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Personaggi</span>
            </button>
          )}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
            onClick={handleLogout}
            title="Esci"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  )
}

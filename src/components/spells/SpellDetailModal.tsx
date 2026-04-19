import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { SpellDetail } from './SpellDetail'
import type { Spell } from '@/types'

interface SpellDetailModalProps {
  spell: Spell | null
  onClose: () => void
}

export function SpellDetailModal({ spell, onClose }: SpellDetailModalProps) {
  return (
    <Dialog open={!!spell} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{spell?.name}</DialogTitle>
        </DialogHeader>
        {spell && <SpellDetail spell={spell} />}
      </DialogContent>
    </Dialog>
  )
}

CREATE TABLE public.spell_slots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  slot_level    int  NOT NULL CHECK (slot_level >= 1 AND slot_level <= 9),
  max_slots     int  NOT NULL DEFAULT 0,
  used_slots    int  NOT NULL DEFAULT 0,
  updated_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE (character_id, slot_level),
  CONSTRAINT used_le_max CHECK (used_slots <= max_slots)
);

ALTER TABLE public.spell_slots ENABLE ROW LEVEL SECURITY;

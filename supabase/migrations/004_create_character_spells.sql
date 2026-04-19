CREATE TABLE public.character_spells (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id    uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  spell_id        uuid NOT NULL REFERENCES public.spells(id) ON DELETE CASCADE,
  personal_notes  text,
  is_prepared     boolean NOT NULL DEFAULT false,
  added_at        timestamptz DEFAULT now() NOT NULL,
  UNIQUE (character_id, spell_id)
);

ALTER TABLE public.character_spells ENABLE ROW LEVEL SECURITY;

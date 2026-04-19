-- Aggiunge supporto multiclasse ai personaggi
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS class2  text,
  ADD COLUMN IF NOT EXISTS level2  integer CHECK (level2 >= 1 AND level2 <= 20);

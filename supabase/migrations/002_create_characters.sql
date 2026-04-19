CREATE TABLE public.characters (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  class      text NOT NULL,
  level      int  NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 20),
  notes      text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

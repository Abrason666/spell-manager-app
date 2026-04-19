CREATE TABLE public.spells (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id     int  UNIQUE,
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  level         int  NOT NULL CHECK (level >= 0 AND level <= 9),
  school        text NOT NULL,
  casting_time  text NOT NULL,
  range         text NOT NULL,
  components    text NOT NULL,
  concentration boolean NOT NULL DEFAULT false,
  ritual        boolean NOT NULL DEFAULT false,
  description   text,
  higher_levels text,
  duration      text,
  classes       text[] NOT NULL DEFAULT '{}',
  source        text DEFAULT 'PHB',
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.spells ENABLE ROW LEVEL SECURITY;

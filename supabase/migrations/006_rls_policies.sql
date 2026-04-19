-- profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- characters
CREATE POLICY "Users can CRUD own characters"
  ON public.characters FOR ALL USING (auth.uid() = user_id);

-- spells (read-only per tutti gli autenticati)
CREATE POLICY "Authenticated users can read spells"
  ON public.spells FOR SELECT USING (auth.role() = 'authenticated');

-- character_spells
CREATE POLICY "Users can CRUD own character spells"
  ON public.character_spells FOR ALL USING (
    character_id IN (
      SELECT id FROM public.characters WHERE user_id = auth.uid()
    )
  );

-- spell_slots
CREATE POLICY "Users can CRUD own spell slots"
  ON public.spell_slots FOR ALL USING (
    character_id IN (
      SELECT id FROM public.characters WHERE user_id = auth.uid()
    )
  );

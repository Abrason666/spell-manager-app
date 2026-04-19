-- Auto-crea profilo alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-crea 9 righe spell_slots alla creazione di un personaggio
CREATE OR REPLACE FUNCTION public.handle_new_character()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.spell_slots (character_id, slot_level, max_slots, used_slots)
  SELECT NEW.id, generate_series(1, 9), 0, 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_character_created ON public.characters;
CREATE TRIGGER on_character_created
  AFTER INSERT ON public.characters
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_character();

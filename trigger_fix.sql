-- Supprimer si existant
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Créer le profile automatiquement
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    phone,
    role,
    avatar_url,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    CONCAT_WS(' ', NEW.user_metadata->>'firstName', NEW.user_metadata->>'lastName'),
    NEW.user_metadata->>'phone',
    COALESCE(NEW.user_metadata->>'role','user'),
    NEW.user_metadata->>'avatarUrl',
    true
  );

  -- Si role = superadmin, créer en même temps dans super_admins
  IF (NEW.user_metadata->>'role' = 'superadmin') THEN
    INSERT INTO public.super_admins (
      id,
      email,
      nom,
      prenom,
      phone,
      est_actif
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.user_metadata->>'lastName',
      NEW.user_metadata->>'firstName',
      NEW.user_metadata->>'phone',
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trg_handle_new_user ON auth.users;
CREATE TRIGGER trg_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

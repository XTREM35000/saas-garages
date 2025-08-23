-- Migration pour créer la fonction ensure_unique_user
-- Cette fonction vérifie l'unicité de l'email et du téléphone

-- Créer la fonction ensure_unique_user
CREATE OR REPLACE FUNCTION public.ensure_unique_user(
  p_email TEXT,
  p_phone TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier l'unicité de l'email
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email déjà utilisé';
  END IF;
  
  -- Vérifier l'unicité du téléphone
  IF EXISTS (SELECT 1 FROM auth.users WHERE phone = p_phone) THEN
    RAISE EXCEPTION 'Téléphone déjà utilisé';
  END IF;
  
  -- Vérifier aussi dans public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email déjà utilisé';
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.users WHERE phone = p_phone) THEN
    RAISE EXCEPTION 'Téléphone déjà utilisé';
  END IF;
  
  -- Vérifier aussi dans public.profiles
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email déjà utilisé';
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.profiles WHERE phone = p_phone) THEN
    RAISE EXCEPTION 'Téléphone déjà utilisé';
  END IF;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.ensure_unique_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_unique_user TO anon;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.ensure_unique_user IS 'Fonction pour vérifier l''unicité de l''email et du téléphone dans toutes les tables utilisateurs';

-- Script de correction pour la création de Super Admin
-- Exécuter ce script dans votre base de données Supabase

-- 1. Supprimer l'ancien trigger et fonction
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Créer la nouvelle fonction handle_new_user corrigée
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
    -- Vérifier qu'aucun super admin n'existe déjà
    IF NOT EXISTS (SELECT 1 FROM public.super_admins WHERE est_actif = true) THEN
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger
DROP TRIGGER IF EXISTS trg_handle_new_user ON auth.users;
CREATE TRIGGER trg_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Modifier la politique RLS pour permettre l'insertion via le trigger
DROP POLICY IF EXISTS "single_super_admin" ON public.super_admins;
CREATE POLICY "single_super_admin" ON public.super_admins
    FOR INSERT WITH CHECK (
        -- Permettre l'insertion si aucun super admin n'existe
        NOT EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE est_actif = true
        )
        OR
        -- Ou permettre l'insertion via le trigger (auth.uid() sera NULL dans le contexte du trigger)
        auth.uid() IS NULL
    );

-- 5. Ajouter une politique pour permettre l'insertion par le service role
CREATE POLICY "service_role_insert" ON public.super_admins
    FOR INSERT WITH CHECK (true);

-- 6. Vérifier que les permissions sont correctes
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.super_admins TO postgres, anon, authenticated, service_role;

-- 7. Créer une fonction de test pour vérifier la création
CREATE OR REPLACE FUNCTION test_super_admin_creation()
RETURNS TEXT AS $$
DECLARE
    test_user_id UUID;
    profile_count INTEGER;
    super_admin_count INTEGER;
BEGIN
    -- Vérifier qu'aucun super admin n'existe
    SELECT COUNT(*) INTO super_admin_count FROM public.super_admins WHERE est_actif = true;
    
    IF super_admin_count > 0 THEN
        RETURN 'Un super admin existe déjà. Test annulé.';
    END IF;
    
    -- Créer un utilisateur de test
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'test@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"firstName": "Test", "lastName": "Admin", "phone": "123456789", "role": "superadmin"}',
        'authenticated',
        'authenticated',
        now(),
        now()
    ) RETURNING id INTO test_user_id;
    
    -- Vérifier que le profil a été créé
    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE user_id = test_user_id;
    
    -- Vérifier que le super admin a été créé
    SELECT COUNT(*) INTO super_admin_count FROM public.super_admins WHERE id = test_user_id;
    
    -- Nettoyer
    DELETE FROM auth.users WHERE id = test_user_id;
    
    IF profile_count = 1 AND super_admin_count = 1 THEN
        RETURN 'Test réussi: profil et super admin créés correctement';
    ELSE
        RETURN 'Test échoué: profil=' || profile_count || ', super_admin=' || super_admin_count;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN 'Erreur lors du test: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 8. Commentaires
COMMENT ON FUNCTION public.handle_new_user() IS 'Fonction trigger pour créer automatiquement profil et super_admin lors de la création d''un utilisateur';
COMMENT ON FUNCTION test_super_admin_creation() IS 'Fonction de test pour vérifier la création de super admin';

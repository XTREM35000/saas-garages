-- ==========================================
-- Storage bucket for avatars + RPC updates
-- ==========================================

-- 1) Create storage bucket 'avatars' if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    PERFORM storage.create_bucket(
      bucket_id => 'avatars',
      public => true
    );
  END IF;
END $$;

-- 2) Storage policies: allow read to all, insert to anon/auth, update/delete only auth
DO $$
BEGIN
  -- READ
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'avatars_read_all'
  ) THEN
    CREATE POLICY avatars_read_all ON storage.objects
      FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'avatars_insert_all'
  ) THEN
    CREATE POLICY avatars_insert_all ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'avatars');
  END IF;

  -- UPDATE (authenticated only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'avatars_update_auth'
  ) THEN
    CREATE POLICY avatars_update_auth ON storage.objects
      FOR UPDATE
      USING (bucket_id = 'avatars' AND auth.role() = 'authenticated')
      WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
  END IF;

  -- DELETE (authenticated only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'avatars_delete_auth'
  ) THEN
    CREATE POLICY avatars_delete_auth ON storage.objects
      FOR DELETE
      USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- 3) Update RPC: create_super_admin_complete to accept avatar
CREATE OR REPLACE FUNCTION public.create_super_admin_complete(
  p_email text,
  p_password text,
  p_name text,
  p_phone text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_has_super boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.super_admins WHERE est_actif = true) INTO v_has_super;
  IF v_has_super THEN
    RETURN jsonb_build_object('success', false, 'error', 'Un Super Admin existe déjà');
  END IF;

  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email requis');
  END IF;
  IF p_password IS NULL OR length(p_password) < 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mot de passe trop court');
  END IF;
  IF p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Téléphone requis');
  END IF;
  IF NOT public.is_valid_phone(p_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Format de téléphone invalide');
  END IF;

  PERFORM public.ensure_unique_user(p_email, p_phone);

  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, email, phone, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    p_phone,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('display_name', p_name, 'phone', p_phone, 'role', 'super_admin', 'avatar_url', p_avatar_url),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  INSERT INTO public.profiles (
    id, email, name, full_name, phone, role, is_superadmin, avatar_url, created_at, updated_at
  ) VALUES (
    v_user_id, p_email, p_name, p_name, p_phone, 'super_admin', true, p_avatar_url, now(), now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_superadmin = EXCLUDED.is_superadmin,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();

  INSERT INTO public.super_admins (
    id, user_id, email, name, phone, role, est_actif, pricing_plan, trial_started_at, trial_ends_at, trial_consumed, created_at
  ) VALUES (
    v_user_id, v_user_id, p_email, p_name, p_phone, 'super_admin', true, 'free', now(), now() + interval '7 days', false, now()
  );

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 4) Update RPC: create_admin_complete to accept avatar
CREATE OR REPLACE FUNCTION public.create_admin_complete(
  p_email text,
  p_password text,
  p_name text,
  p_phone text DEFAULT NULL,
  p_pricing_plan text DEFAULT 'starter',
  p_avatar_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_super_admin_id uuid;
BEGIN
  SELECT user_id INTO v_super_admin_id FROM public.super_admins WHERE est_actif = true LIMIT 1;
  IF v_super_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aucun super admin trouvé');
  END IF;

  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, email, phone, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    p_phone,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('display_name', p_name, 'phone', p_phone, 'role', 'admin', 'avatar_url', p_avatar_url),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  INSERT INTO public.profiles (
    id, email, name, full_name, phone, role, avatar_url, created_at, updated_at
  ) VALUES (
    v_user_id, p_email, p_name, p_name, p_phone, 'admin', p_avatar_url, now(), now()
  );

  INSERT INTO public.admins (
    id, super_admin_id, email, name, pricing_plan, phone, created_at
  ) VALUES (
    v_user_id, v_super_admin_id, p_email, p_name, p_pricing_plan, p_phone, now()
  );

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;



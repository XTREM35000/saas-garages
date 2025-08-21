-- ==========================================
-- Super Admin pricing + validations + RPCs
-- ==========================================

-- 0) Helper: create enum pricing_plan_type if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_plan_type') THEN
    CREATE TYPE pricing_plan_type AS ENUM ('free', 'mensuel', 'annuel');
  END IF;
END $$;

-- 1) Extend super_admins with pricing/trial metadata if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'pricing_plan'
  ) THEN
    ALTER TABLE public.super_admins ADD COLUMN pricing_plan pricing_plan_type NOT NULL DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'trial_started_at'
  ) THEN
    ALTER TABLE public.super_admins ADD COLUMN trial_started_at timestamptz NOT NULL DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE public.super_admins ADD COLUMN trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'trial_consumed'
  ) THEN
    ALTER TABLE public.super_admins ADD COLUMN trial_consumed boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2) Phone validation helper
CREATE OR REPLACE FUNCTION public.is_valid_phone(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Accept formats starting with + and 6-20 digits total after +, or local 8-20 digits
  RETURN (
    p_phone ~ '^\+[0-9]{6,20}$' OR
    p_phone ~ '^[0-9]{8,20}$'
  );
END;
$$;

-- 3) Check uniqueness across auth.users and profiles
CREATE OR REPLACE FUNCTION public.ensure_unique_user(p_email text, p_phone text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_exists boolean;
BEGIN
  -- Email unique in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users u WHERE lower(u.email) = lower(p_email)) INTO v_exists;
  IF v_exists THEN
    RAISE EXCEPTION 'Email déjà utilisé' USING ERRCODE = 'unique_violation';
  END IF;

  -- Phone optional but if provided, must be unique across auth.users.phone or profiles.phone
  IF p_phone IS NOT NULL AND length(trim(p_phone)) > 0 THEN
    SELECT EXISTS(
      SELECT 1 FROM auth.users u WHERE u.phone = p_phone
      UNION ALL
      SELECT 1 FROM public.profiles pr WHERE pr.phone = p_phone
      LIMIT 1
    ) INTO v_exists;
    IF v_exists THEN
      RAISE EXCEPTION 'Téléphone déjà utilisé' USING ERRCODE = 'unique_violation';
    END IF;
  END IF;
END;
$$ SECURITY DEFINER;

-- 4) Replace create_super_admin_complete with transactional, validated version
CREATE OR REPLACE FUNCTION public.create_super_admin_complete(
  p_email text,
  p_password text,
  p_name text,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_has_super boolean;
BEGIN
  -- Enforce single active super admin
  SELECT EXISTS(SELECT 1 FROM public.super_admins WHERE est_actif = true) INTO v_has_super;
  IF v_has_super THEN
    RETURN jsonb_build_object('success', false, 'error', 'Un Super Admin existe déjà');
  END IF;

  -- Basic validations
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

  -- Uniqueness checks
  PERFORM public.ensure_unique_user(p_email, p_phone);

  -- Create user id
  v_user_id := gen_random_uuid();

  -- Insert into auth.users with phone and display metadata
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    phone,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    p_phone,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('display_name', p_name, 'phone', p_phone, 'role', 'super_admin'),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- Upsert into profiles (trigger on auth.users may also insert)
  INSERT INTO public.profiles (
    id,
    email,
    name,
    full_name,
    phone,
    role,
    is_superadmin,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_name,
    p_name,
    p_phone,
    'super_admin',
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_superadmin = EXCLUDED.is_superadmin,
    updated_at = now();

  -- Insert into super_admins with pricing defaults
  INSERT INTO public.super_admins (
    id,
    user_id,
    email,
    name,
    phone,
    role,
    est_actif,
    pricing_plan,
    trial_started_at,
    trial_ends_at,
    trial_consumed,
    created_at
  ) VALUES (
    v_user_id,
    v_user_id,
    p_email,
    p_name,
    p_phone,
    'super_admin',
    true,
    'free',
    now(),
    now() + interval '7 days',
    false,
    now()
  );

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);

EXCEPTION WHEN others THEN
  -- Any failure will rollback the transaction of this function call
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 5) Plan update with trial enforcement
CREATE OR REPLACE FUNCTION public.update_super_admin_plan(
  p_user_id uuid,
  p_plan pricing_plan_type
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec public.super_admins%ROWTYPE;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id requis');
  END IF;

  SELECT * INTO v_rec FROM public.super_admins WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Super Admin introuvable');
  END IF;

  -- If trial expired mark consumed
  IF v_rec.trial_consumed IS FALSE AND now() > v_rec.trial_ends_at THEN
    UPDATE public.super_admins SET trial_consumed = true WHERE user_id = p_user_id;
    v_rec.trial_consumed := true;
  END IF;

  -- Prevent restarting trial by changing plan back and forth
  IF p_plan IN ('mensuel', 'annuel') THEN
    UPDATE public.super_admins
    SET pricing_plan = p_plan,
        trial_consumed = true,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- p_plan = 'free'
    UPDATE public.super_admins
    SET pricing_plan = 'free',
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'plan', p_plan);
END;
$$;

-- 6) Helper to get subscription state
CREATE OR REPLACE FUNCTION public.get_super_admin_subscription_state(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec public.super_admins%ROWTYPE;
BEGIN
  SELECT * INTO v_rec FROM public.super_admins WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Super Admin introuvable');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'plan', v_rec.pricing_plan,
    'trial_started_at', v_rec.trial_started_at,
    'trial_ends_at', v_rec.trial_ends_at,
    'trial_consumed', v_rec.trial_consumed,
    'trial_active', (now() <= v_rec.trial_ends_at AND v_rec.trial_consumed = false)
  );
END;
$$;

-- 7) Grants
GRANT EXECUTE ON FUNCTION public.create_super_admin_complete(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_super_admin_plan(uuid, pricing_plan_type) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_super_admin_subscription_state(uuid) TO authenticated;



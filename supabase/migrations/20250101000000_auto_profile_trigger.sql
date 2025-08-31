-- Trigger pour créer automatiquement les profils et super_admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id, email, role, full_name, phone, avatar_url, organization_id, created_at, updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 
             COALESCE(NEW.raw_user_meta_data->>'firstName', '') || ' ' || 
             COALESCE(NEW.raw_user_meta_data->>'lastName', '')),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NULL, -- organization_id
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into public.super_admins si role = 'super_admin'
  IF (NEW.raw_user_meta_data->>'role' = 'super_admin') THEN
    INSERT INTO public.super_admins (
      user_id, permissions, is_active, pricing_plan_id, trial_ends_at, created_at
    )
    VALUES (
      NEW.id,
      '["all"]'::jsonb,
      true,
      NULL,
      NULL,
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
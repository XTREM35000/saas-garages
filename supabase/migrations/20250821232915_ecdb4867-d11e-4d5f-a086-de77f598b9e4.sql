-- Fix missing code column in organisations table
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS code TEXT;

-- Update existing organisations with a default code if they don't have one
UPDATE organisations 
SET code = COALESCE(code, slug, id::text)
WHERE code IS NULL OR code = '';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_organisations_code ON organisations(code);

-- Fix missing RPC functions
CREATE OR REPLACE FUNCTION verify_sms_code(p_code text, p_phone text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple validation for demo purposes
  IF p_code = '123456' OR p_code = '000000' THEN
    UPDATE profiles 
    SET phone_verified = true
    WHERE id = auth.uid();
    
    RETURN jsonb_build_object('success', true, 'message', 'Code validé');
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Code invalide');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_organisations', (SELECT COUNT(*) FROM organisations),
    'total_garages', (SELECT COUNT(*) FROM garages)
  ) INTO stats;
  
  RETURN stats;
END;
$$;

CREATE OR REPLACE FUNCTION initialize_saas_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Initialize basic schema if needed
  INSERT INTO organisations (name, slug, code, subscription_type)
  VALUES ('Default Organization', 'default', 'ORG-DEFAULT', 'free')
  ON CONFLICT DO NOTHING;
END;
$$;
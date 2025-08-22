-- Fix missing RPC function for SMS validation
CREATE OR REPLACE FUNCTION public.verify_sms_code(p_user_id uuid, p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_code text;
  v_expires_at timestamp with time zone;
BEGIN
  -- Get stored code and expiration
  SELECT sms_code, sms_code_expires_at 
  INTO v_stored_code, v_expires_at
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Check if code exists and hasn't expired
  IF v_stored_code IS NULL OR v_expires_at < NOW() THEN
    RETURN false;
  END IF;
  
  -- Verify code matches
  IF v_stored_code = p_code THEN
    -- Clear the code after successful verification
    UPDATE profiles 
    SET sms_code = NULL, 
        sms_code_expires_at = NULL,
        phone_verified = true
    WHERE id = p_user_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
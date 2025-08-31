-- Create the missing get_workflow_state RPC function
CREATE OR REPLACE FUNCTION public.get_workflow_state()
RETURNS JSON AS $$
DECLARE
  has_super_admin BOOLEAN := FALSE;
  has_admin BOOLEAN := FALSE;
  has_organization BOOLEAN := FALSE;
  has_garage BOOLEAN := FALSE;
  current_step TEXT := 'super_admin';
  is_completed BOOLEAN := FALSE;
  result JSON;
BEGIN
  -- Check if super admin exists
  SELECT EXISTS(
    SELECT 1 FROM super_admins WHERE est_actif = true
  ) INTO has_super_admin;
  
  -- Check if admin exists for current user
  IF auth.uid() IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO has_admin;
    
    -- Check if organization exists for current user
    SELECT EXISTS(
      SELECT 1 FROM user_organisations WHERE user_id = auth.uid()
    ) INTO has_organization;
    
    -- Check if garage exists for user's organization
    SELECT EXISTS(
      SELECT 1 FROM garages g
      JOIN user_organisations uo ON g.organisation_id = uo.organisation_id
      WHERE uo.user_id = auth.uid()
    ) INTO has_garage;
  END IF;
  
  -- Determine current step
  IF NOT has_super_admin THEN
    current_step := 'super_admin';
  ELSIF NOT has_admin THEN
    current_step := 'admin';
  ELSIF NOT has_organization THEN
    current_step := 'organization';
  ELSIF NOT has_garage THEN
    current_step := 'garage';
  ELSE
    current_step := 'dashboard';
    is_completed := TRUE;
  END IF;
  
  -- Build result
  result := json_build_object(
    'has_super_admin', has_super_admin,
    'has_admin', has_admin,
    'has_organization', has_organization,
    'has_garage', has_garage,
    'current_step', current_step,
    'is_completed', is_completed
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Ajouter les colonnes manquantes à workflow_states si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_states' AND column_name = 'meta') THEN
        ALTER TABLE workflow_states ADD COLUMN meta jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Fonction pour vérifier l'état du workflow
CREATE OR REPLACE FUNCTION check_workflow_state()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_super_admin boolean := false;
  has_admin boolean := false;
  has_organization boolean := false;
  has_garage boolean := false;
  current_step text := 'super_admin_check';
BEGIN
  -- Vérifier si un super admin existe
  SELECT EXISTS(SELECT 1 FROM super_admins WHERE est_actif = true) INTO has_super_admin;
  
  -- Vérifier si un admin standard existe
  SELECT EXISTS(SELECT 1 FROM admins LIMIT 1) INTO has_admin;
  
  -- Vérifier si une organisation existe
  SELECT EXISTS(SELECT 1 FROM organizations LIMIT 1) INTO has_organization;
  
  -- Vérifier si un garage existe
  SELECT EXISTS(SELECT 1 FROM garages WHERE is_active = true LIMIT 1) INTO has_garage;
  
  -- Déterminer l'étape actuelle
  IF NOT has_super_admin THEN
    current_step := 'super_admin';
  ELSIF NOT has_admin THEN
    current_step := 'admin';
  ELSIF NOT has_organization THEN
    current_step := 'organization';
  ELSIF NOT has_garage THEN
    current_step := 'garage';
  ELSE
    current_step := 'completed';
  END IF;
  
  RETURN jsonb_build_object(
    'current_step', current_step,
    'has_super_admin', has_super_admin,
    'has_admin', has_admin,
    'has_organization', has_organization,
    'has_garage', has_garage,
    'is_completed', (has_super_admin AND has_admin AND has_organization AND has_garage)
  );
END;
$$;

-- Fonction pour valider le code SMS
CREATE OR REPLACE FUNCTION validate_sms_code(p_code text, p_phone text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_validation sms_validations%ROWTYPE;
BEGIN
  -- Obtenir l'utilisateur actuel
  SELECT auth.uid() INTO v_user_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Non authentifié');
  END IF;
  
  -- Rechercher la validation SMS
  SELECT * INTO v_validation
  FROM sms_validations
  WHERE user_id = v_user_id
    AND code = p_code
    AND (p_phone IS NULL OR phone = p_phone)
    AND created_at > NOW() - INTERVAL '10 minutes'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code invalide ou expiré');
  END IF;
  
  -- Marquer comme validé
  UPDATE sms_validations
  SET validated = true
  WHERE id = v_validation.id;
  
  -- Mettre à jour le profil
  UPDATE profiles
  SET phone_verified = true
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Code validé avec succès');
END;
$$;

-- Fonction pour créer un garage complet
CREATE OR REPLACE FUNCTION create_garage_complete(
  p_name text,
  p_address text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
  v_garage_id uuid;
BEGIN
  -- Obtenir l'organisation existante
  SELECT id INTO v_org_id
  FROM organizations
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aucune organisation trouvée');
  END IF;
  
  -- Créer le garage
  INSERT INTO garages (
    name,
    address,
    phone,
    organisation_id,
    is_active,
    created_at
  ) VALUES (
    p_name,
    p_address,
    p_phone,
    v_org_id,
    true,
    now()
  ) RETURNING id INTO v_garage_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'garage_id', v_garage_id,
    'message', 'Garage créé avec succès'
  );
END;
$$;
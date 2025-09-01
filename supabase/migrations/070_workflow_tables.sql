-- Migration pour les tables du workflow d'onboarding
-- 070_workflow_tables.sql

-- Table pour stocker l'état du workflow
CREATE TABLE IF NOT EXISTS workflow_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'super_admin',
  completed_steps TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les plans d'abonnement
CREATE TABLE IF NOT EXISTS admin_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les validations SMS
CREATE TABLE IF NOT EXISTS sms_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  validation_code TEXT NOT NULL,
  is_validated BOOLEAN DEFAULT FALSE,
  is_used BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_workflow_states_user_id ON workflow_states(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_current_step ON workflow_states(current_step);
CREATE INDEX IF NOT EXISTS idx_admin_plans_admin_id ON admin_plans(admin_id);
CREATE INDEX IF NOT EXISTS idx_sms_validations_organization_id ON sms_validations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_validations_phone_number ON sms_validations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_validations_code ON sms_validations(validation_code);

-- RLS Policies pour workflow_states
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow state" ON workflow_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow state" ON workflow_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow state" ON workflow_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow state" ON workflow_states
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies pour admin_plans
ALTER TABLE admin_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own plans" ON admin_plans
  FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY "Admins can insert their own plans" ON admin_plans
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own plans" ON admin_plans
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their own plans" ON admin_plans
  FOR DELETE USING (auth.uid() = admin_id);

-- RLS Policies pour sms_validations
ALTER TABLE sms_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can view their SMS validations" ON sms_validations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = sms_validations.organization_id 
      AND organizations.admin_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can insert SMS validations" ON sms_validations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = sms_validations.organization_id 
      AND organizations.admin_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can update their SMS validations" ON sms_validations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = sms_validations.organization_id 
      AND organizations.admin_id = auth.uid()
    )
  );

-- Fonctions RPC pour le workflow

-- Fonction pour vérifier si un super admin existe
CREATE OR REPLACE FUNCTION check_super_admin_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'super_admin'
    AND deleted_at IS NULL
  );
END;
$$;

-- Fonction pour vérifier si un admin existe
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
    AND deleted_at IS NULL
  );
END;
$$;

-- Fonction pour créer un super admin
CREATE OR REPLACE FUNCTION create_super_admin(
  email TEXT,
  password TEXT,
  profile_data JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Vérifier si un super admin existe déjà
  IF check_super_admin_exists() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Un super admin existe déjà'
    );
  END IF;

  -- Créer l'utilisateur
  INSERT INTO auth.users (
    email,
    encrypted_password,
    raw_user_meta_data,
    email_confirmed_at
  ) VALUES (
    email,
    crypt(password, gen_salt('bf')),
    jsonb_build_object(
      'role', 'super_admin',
      'profile', profile_data
    ),
    NOW()
  ) RETURNING id INTO new_user_id;

  -- Créer le profil super admin
  INSERT INTO super_admins (
    id,
    email,
    name,
    phone,
    is_active
  ) VALUES (
    new_user_id,
    email,
    COALESCE(profile_data->>'name', 'Super Admin'),
    profile_data->>'phone',
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Super admin créé avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Fonction pour créer un admin
CREATE OR REPLACE FUNCTION create_admin(
  email TEXT,
  password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Créer l'utilisateur
  INSERT INTO auth.users (
    email,
    encrypted_password,
    raw_user_meta_data,
    email_confirmed_at
  ) VALUES (
    email,
    crypt(password, gen_salt('bf')),
    jsonb_build_object('role', 'admin'),
    NOW()
  ) RETURNING id INTO new_user_id;

  -- Créer le profil admin
  INSERT INTO admins (
    id,
    email,
    is_active
  ) VALUES (
    new_user_id,
    email,
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Admin créé avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Fonction pour envoyer un code SMS
CREATE OR REPLACE FUNCTION send_sms_validation(
  organization_id UUID,
  phone_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  validation_code TEXT;
  validation_id UUID;
BEGIN
  -- Générer un code à 6 chiffres
  validation_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Insérer la validation
  INSERT INTO sms_validations (
    organization_id,
    phone_number,
    validation_code
  ) VALUES (
    organization_id,
    phone_number,
    validation_code
  ) RETURNING id INTO validation_id;

  -- Ici, vous intégreriez votre service SMS
  -- Pour l'instant, on retourne le code (en production, ne pas le faire)
  
  RETURN jsonb_build_object(
    'success', true,
    'validation_id', validation_id,
    'code', validation_code, -- À retirer en production
    'message', 'Code SMS envoyé'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Fonction pour valider un code SMS
CREATE OR REPLACE FUNCTION validate_sms_code(
  validation_id UUID,
  code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  validation_record RECORD;
BEGIN
  -- Récupérer la validation
  SELECT * INTO validation_record
  FROM sms_validations
  WHERE id = validation_id
  AND validation_code = code
  AND is_used = false
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Code invalide ou expiré'
    );
  END IF;

  -- Marquer comme validé
  UPDATE sms_validations
  SET 
    is_validated = true,
    validated_at = NOW(),
    updated_at = NOW()
  WHERE id = validation_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Code validé avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Triggers pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_states_updated_at 
  BEFORE UPDATE ON workflow_states 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_plans_updated_at 
  BEFORE UPDATE ON admin_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_validations_updated_at 
  BEFORE UPDATE ON sms_validations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
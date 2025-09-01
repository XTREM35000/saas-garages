-- Script de correction pour les tables du workflow
-- À exécuter directement dans l'interface SQL de Supabase

-- 1. Créer la table workflow_states si elle n'existe pas
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

-- 2. Créer la table admin_plans si elle n'existe pas
CREATE TABLE IF NOT EXISTS admin_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table sms_validations si elle n'existe pas
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

-- 4. Créer les index
CREATE INDEX IF NOT EXISTS idx_workflow_states_user_id ON workflow_states(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_current_step ON workflow_states(current_step);
CREATE INDEX IF NOT EXISTS idx_admin_plans_admin_id ON admin_plans(admin_id);
CREATE INDEX IF NOT EXISTS idx_sms_validations_organization_id ON sms_validations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_validations_phone_number ON sms_validations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_validations_code ON sms_validations(validation_code);

-- 5. Activer RLS sur workflow_states
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own workflow state" ON workflow_states;
DROP POLICY IF EXISTS "Users can insert their own workflow state" ON workflow_states;
DROP POLICY IF EXISTS "Users can update their own workflow state" ON workflow_states;
DROP POLICY IF EXISTS "Users can delete their own workflow state" ON workflow_states;

-- 7. Créer les nouvelles politiques RLS pour workflow_states
CREATE POLICY "Users can view their own workflow state" ON workflow_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow state" ON workflow_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow state" ON workflow_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow state" ON workflow_states
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Activer RLS sur admin_plans
ALTER TABLE admin_plans ENABLE ROW LEVEL SECURITY;

-- 9. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Admins can view their own plans" ON admin_plans;
DROP POLICY IF EXISTS "Admins can insert their own plans" ON admin_plans;
DROP POLICY IF EXISTS "Admins can update their own plans" ON admin_plans;
DROP POLICY IF EXISTS "Admins can delete their own plans" ON admin_plans;

-- 10. Créer les nouvelles politiques RLS pour admin_plans
CREATE POLICY "Admins can view their own plans" ON admin_plans
  FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY "Admins can insert their own plans" ON admin_plans
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own plans" ON admin_plans
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their own plans" ON admin_plans
  FOR DELETE USING (auth.uid() = admin_id);

-- 11. Activer RLS sur sms_validations
ALTER TABLE sms_validations ENABLE ROW LEVEL SECURITY;

-- 12. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Organization admins can view their SMS validations" ON sms_validations;
DROP POLICY IF EXISTS "Organization admins can insert SMS validations" ON sms_validations;
DROP POLICY IF EXISTS "Organization admins can update their SMS validations" ON sms_validations;

-- 13. Créer les nouvelles politiques RLS pour sms_validations
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

-- 14. Créer les fonctions RPC nécessaires

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

-- 15. Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Créer les triggers
DROP TRIGGER IF EXISTS update_workflow_states_updated_at ON workflow_states;
CREATE TRIGGER update_workflow_states_updated_at 
  BEFORE UPDATE ON workflow_states 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_plans_updated_at ON admin_plans;
CREATE TRIGGER update_admin_plans_updated_at 
  BEFORE UPDATE ON admin_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sms_validations_updated_at ON sms_validations;
CREATE TRIGGER update_sms_validations_updated_at 
  BEFORE UPDATE ON sms_validations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Vérifier que tout est créé
SELECT 'Tables créées avec succès' as status; 
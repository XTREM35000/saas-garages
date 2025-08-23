-- 🗄️ Schéma de Base de Données pour le Workflow d'Onboarding
-- Ce fichier crée toutes les tables nécessaires pour le workflow

-- =====================================================
-- 1. TABLE SUPER ADMINS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_super_admins_permissions ON public.super_admins USING GIN (permissions);
CREATE INDEX IF NOT EXISTS idx_super_admins_created_at ON public.super_admins(created_at);

-- =====================================================
-- 2. TABLE ORGANIZATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  custom_domain TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON public.organizations(domain);
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON public.organizations(custom_domain);
CREATE INDEX IF NOT EXISTS idx_organizations_plan_type ON public.organizations(plan_type);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON public.organizations(created_at);

-- =====================================================
-- 3. TABLE ORGANIZATION PLANS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organization_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_organization_plans_org_id ON public.organization_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_plans_status ON public.organization_plans(status);
CREATE INDEX IF NOT EXISTS idx_organization_plans_start_date ON public.organization_plans(start_date);

-- =====================================================
-- 4. TABLE ORGANIZATION USERS (liaison)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'user')),
  permissions JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte d'unicité pour éviter les doublons
  UNIQUE(user_id, organization_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON public.organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON public.organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_role ON public.organization_users(role);
CREATE INDEX IF NOT EXISTS idx_organization_users_status ON public.organization_users(status);

-- =====================================================
-- 5. TABLE GARAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  opening_hours JSONB DEFAULT '{}',
  services JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_garages_org_id ON public.garages(organization_id);
CREATE INDEX IF NOT EXISTS idx_garages_city ON public.garages(city);
CREATE INDEX IF NOT EXISTS idx_garages_status ON public.garages(status);
CREATE INDEX IF NOT EXISTS idx_garages_location ON public.garages(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_garages_created_at ON public.garages(created_at);

-- =====================================================
-- 6. TABLE WORKFLOW STATES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL CHECK (current_step IN (
    'init', 'loading', 'super_admin_check', 'pricing_selection', 
    'admin_creation', 'org_creation', 'sms_validation', 
    'garage_setup', 'dashboard', 'completed'
  )),
  completed_steps TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_workflow_states_user_id ON public.workflow_states(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_org_id ON public.workflow_states(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_current_step ON public.workflow_states(current_step);
CREATE INDEX IF NOT EXISTS idx_workflow_states_is_completed ON public.workflow_states(is_completed);

-- =====================================================
-- 7. TABLE DOMAIN VERIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.domain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('cname', 'a_record', 'txt')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  verification_data JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_domain_verifications_org_id ON public.domain_verifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_domain_verifications_domain ON public.domain_verifications(domain);
CREATE INDEX IF NOT EXISTS idx_domain_verifications_status ON public.domain_verifications(status);
CREATE INDEX IF NOT EXISTS idx_domain_verifications_expires_at ON public.domain_verifications(expires_at);

-- =====================================================
-- 8. TABLE SMS VALIDATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sms_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_sms_validations_phone ON public.sms_validations(phone);
CREATE INDEX IF NOT EXISTS idx_sms_validations_code ON public.sms_validations(code);
CREATE INDEX IF NOT EXISTS idx_sms_validations_org_id ON public.sms_validations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_validations_user_id ON public.sms_validations(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_validations_status ON public.sms_validations(status);
CREATE INDEX IF NOT EXISTS idx_sms_validations_expires_at ON public.sms_validations(expires_at);

-- =====================================================
-- 9. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers sur toutes les tables
CREATE TRIGGER update_super_admins_updated_at BEFORE UPDATE ON public.super_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_plans_updated_at BEFORE UPDATE ON public.organization_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_users_updated_at BEFORE UPDATE ON public.organization_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_garages_updated_at BEFORE UPDATE ON public.garages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_states_updated_at BEFORE UPDATE ON public.workflow_states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domain_verifications_updated_at BEFORE UPDATE ON public.domain_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_validations_updated_at BEFORE UPDATE ON public.sms_validations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_validations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. COMMENTAIRES ET MÉTADONNÉES
-- =====================================================

COMMENT ON TABLE public.super_admins IS 'Table des Super Administrateurs avec permissions étendues';
COMMENT ON TABLE public.organizations IS 'Table des organisations avec gestion des domaines et plans';
COMMENT ON TABLE public.organization_plans IS 'Table des plans d''abonnement des organisations';
COMMENT ON TABLE public.organization_users IS 'Table de liaison entre utilisateurs et organisations avec rôles';
COMMENT ON TABLE public.garages IS 'Table des garages appartenant aux organisations';
COMMENT ON TABLE public.workflow_states IS 'Table des états du workflow d''onboarding';
COMMENT ON TABLE public.domain_verifications IS 'Table des vérifications de domaines personnalisés';
COMMENT ON TABLE public.sms_validations IS 'Table des validations SMS pour la sécurité';

-- =====================================================
-- 12. DONNÉES INITIALES (OPTIONNEL)
-- =====================================================

-- Insérer des types de plans par défaut si nécessaire
-- INSERT INTO public.plan_types (name, description, features) VALUES 
-- ('free', 'Plan gratuit avec limitations', '{"garages": 1, "clients": 10, "support": "email"}'),
-- ('pro', 'Plan professionnel', '{"garages": 5, "clients": -1, "support": "priority"}'),
-- ('enterprise', 'Plan entreprise', '{"garages": -1, "clients": -1, "support": "24/7"}');

-- =====================================================
-- 13. VUES UTILES
-- =====================================================

-- Vue pour les organisations avec leurs statistiques
CREATE OR REPLACE VIEW public.organization_overview AS
SELECT 
  o.id,
  o.name,
  o.slug,
  o.domain,
  o.custom_domain,
  o.plan_type,
  o.status,
  o.created_at,
  COUNT(DISTINCT ou.user_id) as user_count,
  COUNT(DISTINCT g.id) as garage_count,
  op.status as plan_status,
  op.end_date as plan_end_date
FROM public.organizations o
LEFT JOIN public.organization_users ou ON o.id = ou.organization_id
LEFT JOIN public.garages g ON o.id = g.organization_id
LEFT JOIN public.organization_plans op ON o.id = op.organization_id AND op.status = 'active'
GROUP BY o.id, op.status, op.end_date;

-- Vue pour les utilisateurs avec leurs organisations
CREATE OR REPLACE VIEW public.user_organizations AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.email,
  u.role as user_role,
  o.id as organization_id,
  o.name as organization_name,
  o.slug as organization_slug,
  ou.role as organization_role,
  ou.status as organization_status
FROM public.users u
JOIN public.organization_users ou ON u.id = ou.user_id
JOIN public.organizations o ON ou.organization_id = o.id;

-- =====================================================
-- 14. INDEX COMPOSÉS POUR OPTIMISATION
-- =====================================================

-- Index composé pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_organizations_slug_status ON public.organizations(slug, status);
CREATE INDEX IF NOT EXISTS idx_garages_org_status ON public.garages(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_states_user_step ON public.workflow_states(user_id, current_step);
CREATE INDEX IF NOT EXISTS idx_sms_validations_phone_status ON public.sms_validations(phone, status);

-- =====================================================
-- 15. CONTRAINTES DE VALIDATION
-- =====================================================

-- Validation du format email
ALTER TABLE public.users ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Validation du format téléphone (format français)
ALTER TABLE public.users ADD CONSTRAINT check_phone_format 
CHECK (phone ~* '^(\+33|0)[1-9](\d{8})$');

-- Validation des coordonnées géographiques
ALTER TABLE public.garages ADD CONSTRAINT check_latitude 
CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE public.garages ADD CONSTRAINT check_longitude 
CHECK (longitude >= -180 AND longitude <= 180);

-- Validation du code postal français
ALTER TABLE public.garages ADD CONSTRAINT check_postal_code 
CHECK (postal_code ~* '^[0-9]{5}$');


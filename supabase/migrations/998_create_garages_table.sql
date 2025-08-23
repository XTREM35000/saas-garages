-- Migration pour créer la table garages
-- Cette table stocke les informations des garages

-- Créer la table garages si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.garages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'France',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_garages_organization_id ON public.garages(organization_id);
CREATE INDEX IF NOT EXISTS idx_garages_city ON public.garages(city);
CREATE INDEX IF NOT EXISTS idx_garages_postal_code ON public.garages(postal_code);
CREATE INDEX IF NOT EXISTS idx_garages_is_active ON public.garages(is_active);

-- Créer un index géospatial si PostGIS est disponible
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    CREATE INDEX IF NOT EXISTS idx_garages_location ON public.garages USING GIST (
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    );
  END IF;
END $$;

-- Activer RLS (Row Level Security)
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view garages of their organizations" ON public.garages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE organization_id = garages.organization_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert garages in their organizations" ON public.garages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE organization_id = garages.organization_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update garages of their organizations" ON public.garages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE organization_id = garages.organization_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete garages of their organizations" ON public.garages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE organization_id = garages.organization_id 
      AND user_id = auth.uid()
    )
  );

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_garages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_garages_updated_at
  BEFORE UPDATE ON public.garages
  FOR EACH ROW
  EXECUTE FUNCTION update_garages_updated_at();

-- Donner les permissions
GRANT ALL ON public.garages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.garages IS 'Table des garages des organisations';
COMMENT ON COLUMN public.garages.id IS 'Identifiant unique du garage';
COMMENT ON COLUMN public.garages.organization_id IS 'Référence vers l''organisation propriétaire';
COMMENT ON COLUMN public.garages.name IS 'Nom du garage';
COMMENT ON COLUMN public.garages.address IS 'Adresse complète du garage';
COMMENT ON COLUMN public.garages.city IS 'Ville du garage';
COMMENT ON COLUMN public.garages.postal_code IS 'Code postal du garage';
COMMENT ON COLUMN public.garages.country IS 'Pays du garage';
COMMENT ON COLUMN public.garages.latitude IS 'Latitude GPS du garage';
COMMENT ON COLUMN public.garages.longitude IS 'Longitude GPS du garage';
COMMENT ON COLUMN public.garages.phone IS 'Numéro de téléphone du garage';
COMMENT ON COLUMN public.garages.email IS 'Adresse email du garage';
COMMENT ON COLUMN public.garages.website IS 'Site web du garage';
COMMENT ON COLUMN public.garages.description IS 'Description du garage';
COMMENT ON COLUMN public.garages.is_active IS 'Indique si le garage est actif';
COMMENT ON COLUMN public.garages.created_by IS 'Utilisateur qui a créé le garage';
COMMENT ON COLUMN public.garages.updated_by IS 'Utilisateur qui a modifié le garage en dernier';
COMMENT ON COLUMN public.garages.created_at IS 'Date de création du garage';
COMMENT ON COLUMN public.garages.updated_at IS 'Date de dernière modification du garage';

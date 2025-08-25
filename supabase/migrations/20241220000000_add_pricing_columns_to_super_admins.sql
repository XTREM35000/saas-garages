-- Migration: Ajouter les colonnes pricing_month et pricing_year à la table super_admins
-- Date: 2024-12-20

-- Ajouter les colonnes pricing_month et pricing_year
ALTER TABLE super_admins 
ADD COLUMN pricing_month DECIMAL(10,2) DEFAULT 25000.00,
ADD COLUMN pricing_year DECIMAL(10,2) DEFAULT 250000.00;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN super_admins.pricing_month IS 'Prix mensuel en FCFA pour les abonnements';
COMMENT ON COLUMN super_admins.pricing_year IS 'Prix annuel en FCFA pour les abonnements';

-- Mettre à jour les enregistrements existants avec les valeurs par défaut
UPDATE super_admins 
SET 
  pricing_month = COALESCE(pricing_month, 25000.00),
  pricing_year = COALESCE(pricing_year, 250000.00)
WHERE pricing_month IS NULL OR pricing_year IS NULL;

-- Créer une fonction pour récupérer les prix depuis un super admin
CREATE OR REPLACE FUNCTION get_pricing_from_super_admin()
RETURNS TABLE (
  pricing_month DECIMAL(10,2),
  pricing_year DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.pricing_month,
    sa.pricing_year
  FROM super_admins sa
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une fonction pour mettre à jour les prix
CREATE OR REPLACE FUNCTION update_pricing_from_super_admin(
  p_pricing_month DECIMAL(10,2),
  p_pricing_year DECIMAL(10,2)
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE super_admins 
  SET 
    pricing_month = p_pricing_month,
    pricing_year = p_pricing_year,
    updated_at = NOW()
  WHERE id = (SELECT id FROM super_admins LIMIT 1);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

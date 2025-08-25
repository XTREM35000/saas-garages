-- Migration pour ajouter les colonnes de gestion des numéros de téléphone
-- Date: 2024-12-20

-- Fonction pour nettoyer et formater les numéros de téléphone existants
CREATE OR REPLACE FUNCTION format_existing_phone_numbers()
RETURNS void AS $$
DECLARE
    rec RECORD;
    cleaned_phone TEXT;
    country_code TEXT;
    formatted_phone TEXT;
BEGIN
    -- Traiter les numéros de téléphone existants dans la table users
    FOR rec IN SELECT id, phone FROM users WHERE phone IS NOT NULL AND phone != '' LOOP
        -- Nettoyer le numéro
        cleaned_phone := regexp_replace(rec.phone, '[^\d+]', '', 'g');
        
        -- Détecter le code pays
        IF cleaned_phone LIKE '+33%' OR cleaned_phone LIKE '33%' OR cleaned_phone LIKE '0%' THEN
            country_code := 'FR';
            -- Formater pour la France
            IF cleaned_phone LIKE '0%' THEN
                cleaned_phone := '33' || substring(cleaned_phone from 2);
            ELSIF cleaned_phone LIKE '+33%' THEN
                cleaned_phone := substring(cleaned_phone from 2);
            END IF;
        ELSIF cleaned_phone LIKE '+225%' OR cleaned_phone LIKE '225%' THEN
            country_code := 'CI';
            IF cleaned_phone LIKE '+225%' THEN
                cleaned_phone := substring(cleaned_phone from 2);
            END IF;
        ELSIF cleaned_phone LIKE '+221%' OR cleaned_phone LIKE '221%' THEN
            country_code := 'SN';
            IF cleaned_phone LIKE '+221%' THEN
                cleaned_phone := substring(cleaned_phone from 2);
            END IF;
        ELSE
            country_code := 'FR'; -- Par défaut
        END IF;
        
        -- Mettre à jour les colonnes
        UPDATE users 
        SET 
            phone_country_code = country_code,
            phone_formatted = cleaned_phone,
            phone_display = CASE 
                WHEN country_code = 'FR' THEN '+33 ' || substring(cleaned_phone from 3 for 1) || ' ' || 
                     substring(cleaned_phone from 4 for 2) || ' ' || 
                     substring(cleaned_phone from 6 for 2) || ' ' || 
                     substring(cleaned_phone from 8 for 2) || ' ' || 
                     substring(cleaned_phone from 10 for 2)
                WHEN country_code IN ('CI', 'SN') THEN '+' || substring(cleaned_phone from 1 for 3) || ' ' ||
                     substring(cleaned_phone from 4 for 2) || ' ' || 
                     substring(cleaned_phone from 6 for 2) || ' ' || 
                     substring(cleaned_phone from 8 for 2) || ' ' || 
                     substring(cleaned_phone from 10 for 2)
                ELSE cleaned_phone
            END
        WHERE id = rec.id;
    END LOOP;
    
    -- Pour super_admins, on évite le trigger en utilisant une approche différente
    -- On va juste ajouter les colonnes sans mettre à jour les données existantes
    -- Les données seront mises à jour via l'application
END;
$$ LANGUAGE plpgsql;

-- Ajouter les colonnes à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(2) DEFAULT 'FR',
ADD COLUMN IF NOT EXISTS phone_formatted VARCHAR(20),
ADD COLUMN IF NOT EXISTS phone_display VARCHAR(25);

-- Ajouter les colonnes à la table super_admins (sans trigger de mise à jour)
ALTER TABLE super_admins 
ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(2) DEFAULT 'FR',
ADD COLUMN IF NOT EXISTS phone_formatted VARCHAR(20),
ADD COLUMN IF NOT EXISTS phone_display VARCHAR(25);

-- Ajouter les colonnes à la table organizations (si elle existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') THEN
        ALTER TABLE organizations 
        ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(2) DEFAULT 'FR',
        ADD COLUMN IF NOT EXISTS phone_formatted VARCHAR(20),
        ADD COLUMN IF NOT EXISTS phone_display VARCHAR(25);
    END IF;
END $$;

-- Ajouter les colonnes à la table garages (si elle existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'garages') THEN
        ALTER TABLE garages 
        ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(2) DEFAULT 'FR',
        ADD COLUMN IF NOT EXISTS phone_formatted VARCHAR(20),
        ADD COLUMN IF NOT EXISTS phone_display VARCHAR(25);
    END IF;
END $$;

-- Exécuter la fonction pour formater les numéros existants (users seulement)
SELECT format_existing_phone_numbers();

-- Supprimer la fonction temporaire
DROP FUNCTION format_existing_phone_numbers();

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_phone_country_code ON users(phone_country_code);
CREATE INDEX IF NOT EXISTS idx_super_admins_phone_country_code ON super_admins(phone_country_code);

-- Ajouter des contraintes de validation
ALTER TABLE users 
ADD CONSTRAINT check_phone_country_code 
CHECK (phone_country_code IN ('FR', 'CI', 'SN', 'ML', 'BF', 'NE', 'TG', 'BJ', 'CM', 'TD', 'CF', 'GA', 'CG', 'CD', 'GQ', 'ST', 'GW', 'GN', 'MR', 'GM', 'SL', 'LR', 'GH', 'NG', 'DZ', 'TN', 'LY', 'EG', 'MA', 'SD', 'SS', 'ET', 'ER', 'DJ', 'SO', 'KE', 'TZ', 'UG', 'BI', 'RW', 'MZ', 'ZM', 'ZW', 'BW', 'NA', 'LS', 'SZ', 'MG', 'MU', 'SC', 'KM', 'ZA', 'AO', 'CV'));

ALTER TABLE super_admins 
ADD CONSTRAINT check_super_admins_phone_country_code 
CHECK (phone_country_code IN ('FR', 'CI', 'SN', 'ML', 'BF', 'NE', 'TG', 'BJ', 'CM', 'TD', 'CF', 'GA', 'CG', 'CD', 'GQ', 'ST', 'GW', 'GN', 'MR', 'GM', 'SL', 'LR', 'GH', 'NG', 'DZ', 'TN', 'LY', 'EG', 'MA', 'SD', 'SS', 'ET', 'ER', 'DJ', 'SO', 'KE', 'TZ', 'UG', 'BI', 'RW', 'MZ', 'ZM', 'ZW', 'BW', 'NA', 'LS', 'SZ', 'MG', 'MU', 'SC', 'KM', 'ZA', 'AO', 'CV'));

-- Commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN users.phone_country_code IS 'Code pays ISO 3166-1 alpha-2 pour le numéro de téléphone';
COMMENT ON COLUMN users.phone_formatted IS 'Numéro de téléphone formaté pour le stockage (sans espaces)';
COMMENT ON COLUMN users.phone_display IS 'Numéro de téléphone formaté pour l''affichage (avec espaces)';

COMMENT ON COLUMN super_admins.phone_country_code IS 'Code pays ISO 3166-1 alpha-2 pour le numéro de téléphone';
COMMENT ON COLUMN super_admins.phone_formatted IS 'Numéro de téléphone formaté pour le stockage (sans espaces)';
COMMENT ON COLUMN super_admins.phone_display IS 'Numéro de téléphone formaté pour l''affichage (avec espaces)';

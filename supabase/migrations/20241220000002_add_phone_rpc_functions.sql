-- Migration pour ajouter les fonctions RPC de gestion des numéros de téléphone
-- Date: 2024-12-20

-- Fonction RPC pour mettre à jour le numéro de téléphone d'un super_admin sans déclencher le trigger
CREATE OR REPLACE FUNCTION update_super_admin_phone(
    admin_id UUID,
    phone_country_code VARCHAR(2),
    phone_formatted VARCHAR(20),
    phone_display VARCHAR(25)
)
RETURNS void AS $$
BEGIN
    -- Mettre à jour directement les colonnes sans déclencher les triggers
    UPDATE super_admins 
    SET 
        phone_country_code = update_super_admin_phone.phone_country_code,
        phone_formatted = update_super_admin_phone.phone_formatted,
        phone_display = update_super_admin_phone.phone_display
    WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction RPC pour récupérer un numéro de téléphone formaté
CREATE OR REPLACE FUNCTION get_formatted_phone_number(
    table_name TEXT,
    record_id UUID
)
RETURNS TABLE(
    phone TEXT,
    phone_country_code VARCHAR(2),
    phone_formatted VARCHAR(20),
    phone_display VARCHAR(25)
) AS $$
BEGIN
    -- Retourner les données selon la table
    CASE table_name
        WHEN 'users' THEN
            RETURN QUERY SELECT u.phone, u.phone_country_code, u.phone_formatted, u.phone_display
            FROM users u WHERE u.id = record_id;
        WHEN 'super_admins' THEN
            RETURN QUERY SELECT sa.phone, sa.phone_country_code, sa.phone_formatted, sa.phone_display
            FROM super_admins sa WHERE sa.id = record_id;
        WHEN 'organizations' THEN
            RETURN QUERY SELECT o.phone, o.phone_country_code, o.phone_formatted, o.phone_display
            FROM organizations o WHERE o.id = record_id;
        WHEN 'garages' THEN
            RETURN QUERY SELECT g.phone, g.phone_country_code, g.phone_formatted, g.phone_display
            FROM garages g WHERE g.id = record_id;
        ELSE
            RAISE EXCEPTION 'Table non supportée: %', table_name;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction RPC pour valider un numéro de téléphone
CREATE OR REPLACE FUNCTION validate_phone_number(
    phone_number TEXT,
    country_code VARCHAR(2) DEFAULT 'FR'
)
RETURNS TABLE(
    is_valid BOOLEAN,
    formatted_display TEXT,
    formatted_storage TEXT,
    detected_country VARCHAR(2)
) AS $$
DECLARE
    cleaned_phone TEXT;
    detected_country_code VARCHAR(2);
    national_number TEXT;
    formatted_display TEXT;
    formatted_storage TEXT;
    is_valid BOOLEAN;
BEGIN
    -- Nettoyer le numéro
    cleaned_phone := regexp_replace(phone_number, '[^\d+]', '', 'g');
    
    -- Détecter le pays
    IF cleaned_phone LIKE '+33%' OR cleaned_phone LIKE '33%' OR cleaned_phone LIKE '0%' THEN
        detected_country_code := 'FR';
        IF cleaned_phone LIKE '0%' THEN
            cleaned_phone := '33' || substring(cleaned_phone from 2);
        ELSIF cleaned_phone LIKE '+33%' THEN
            cleaned_phone := substring(cleaned_phone from 2);
        END IF;
    ELSIF cleaned_phone LIKE '+225%' OR cleaned_phone LIKE '225%' THEN
        detected_country_code := 'CI';
        IF cleaned_phone LIKE '+225%' THEN
            cleaned_phone := substring(cleaned_phone from 2);
        END IF;
    ELSIF cleaned_phone LIKE '+221%' OR cleaned_phone LIKE '221%' THEN
        detected_country_code := 'SN';
        IF cleaned_phone LIKE '+221%' THEN
            cleaned_phone := substring(cleaned_phone from 2);
        END IF;
    ELSE
        detected_country_code := country_code;
    END IF;
    
    -- Extraire le numéro national
    national_number := cleaned_phone;
    IF detected_country_code = 'FR' AND cleaned_phone LIKE '33%' THEN
        national_number := substring(cleaned_phone from 3);
    ELSIF detected_country_code IN ('CI', 'SN') AND cleaned_phone LIKE '225%' THEN
        national_number := substring(cleaned_phone from 4);
    ELSIF detected_country_code IN ('CI', 'SN') AND cleaned_phone LIKE '221%' THEN
        national_number := substring(cleaned_phone from 4);
    END IF;
    
    -- Valider la longueur
    is_valid := length(national_number) >= 8 AND length(national_number) <= 15;
    
    -- Formater pour l'affichage
    IF detected_country_code = 'FR' THEN
        formatted_display := '+33 ' || substring(national_number from 1 for 1) || ' ' || 
                           substring(national_number from 2 for 2) || ' ' || 
                           substring(national_number from 4 for 2) || ' ' || 
                           substring(national_number from 6 for 2) || ' ' || 
                           substring(national_number from 8 for 2);
    ELSIF detected_country_code IN ('CI', 'SN') THEN
        formatted_display := '+' || (CASE WHEN detected_country_code = 'CI' THEN '225' ELSE '221' END) || ' ' ||
                           substring(national_number from 1 for 2) || ' ' || 
                           substring(national_number from 3 for 2) || ' ' || 
                           substring(national_number from 5 for 2) || ' ' || 
                           substring(national_number from 7 for 2);
    ELSE
        formatted_display := cleaned_phone;
    END IF;
    
    -- Formater pour le stockage
    formatted_storage := cleaned_phone;
    
    RETURN QUERY SELECT is_valid, formatted_display, formatted_storage, detected_country_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction RPC pour migrer tous les numéros de téléphone existants
CREATE OR REPLACE FUNCTION migrate_all_phone_numbers()
RETURNS TABLE(
    table_name TEXT,
    records_updated INTEGER
) AS $$
DECLARE
    users_count INTEGER := 0;
    super_admins_count INTEGER := 0;
    organizations_count INTEGER := 0;
    garages_count INTEGER := 0;
    rec RECORD;
    cleaned_phone TEXT;
    country_code TEXT;
    formatted_display TEXT;
    formatted_storage TEXT;
BEGIN
    -- Migrer les users
    FOR rec IN SELECT id, phone FROM users WHERE phone IS NOT NULL AND phone != '' LOOP
        -- Nettoyer et formater le numéro
        cleaned_phone := regexp_replace(rec.phone, '[^\d+]', '', 'g');
        
        -- Détecter le pays
        IF cleaned_phone LIKE '+33%' OR cleaned_phone LIKE '33%' OR cleaned_phone LIKE '0%' THEN
            country_code := 'FR';
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
            country_code := 'FR';
        END IF;
        
        -- Formater pour l'affichage
        IF country_code = 'FR' THEN
            formatted_display := '+33 ' || substring(cleaned_phone from 3 for 1) || ' ' || 
                               substring(cleaned_phone from 4 for 2) || ' ' || 
                               substring(cleaned_phone from 6 for 2) || ' ' || 
                               substring(cleaned_phone from 8 for 2) || ' ' || 
                               substring(cleaned_phone from 10 for 2);
        ELSIF country_code IN ('CI', 'SN') THEN
            formatted_display := '+' || substring(cleaned_phone from 1 for 3) || ' ' ||
                               substring(cleaned_phone from 4 for 2) || ' ' || 
                               substring(cleaned_phone from 6 for 2) || ' ' || 
                               substring(cleaned_phone from 8 for 2) || ' ' || 
                               substring(cleaned_phone from 10 for 2);
        ELSE
            formatted_display := cleaned_phone;
        END IF;
        
        formatted_storage := cleaned_phone;
        
        -- Mettre à jour
        UPDATE users 
        SET 
            phone_country_code = country_code,
            phone_formatted = formatted_storage,
            phone_display = formatted_display
        WHERE id = rec.id;
        
        users_count := users_count + 1;
    END LOOP;
    
    -- Migrer les super_admins (sans trigger)
    FOR rec IN SELECT id, phone FROM super_admins WHERE phone IS NOT NULL AND phone != '' LOOP
        -- Même logique de formatage
        cleaned_phone := regexp_replace(rec.phone, '[^\d+]', '', 'g');
        
        IF cleaned_phone LIKE '+33%' OR cleaned_phone LIKE '33%' OR cleaned_phone LIKE '0%' THEN
            country_code := 'FR';
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
            country_code := 'FR';
        END IF;
        
        IF country_code = 'FR' THEN
            formatted_display := '+33 ' || substring(cleaned_phone from 3 for 1) || ' ' || 
                               substring(cleaned_phone from 4 for 2) || ' ' || 
                               substring(cleaned_phone from 6 for 2) || ' ' || 
                               substring(cleaned_phone from 8 for 2) || ' ' || 
                               substring(cleaned_phone from 10 for 2);
        ELSIF country_code IN ('CI', 'SN') THEN
            formatted_display := '+' || substring(cleaned_phone from 1 for 3) || ' ' ||
                               substring(cleaned_phone from 4 for 2) || ' ' || 
                               substring(cleaned_phone from 6 for 2) || ' ' || 
                               substring(cleaned_phone from 8 for 2) || ' ' || 
                               substring(cleaned_phone from 10 for 2);
        ELSE
            formatted_display := cleaned_phone;
        END IF;
        
        formatted_storage := cleaned_phone;
        
        -- Utiliser la fonction RPC pour éviter le trigger
        PERFORM update_super_admin_phone(rec.id, country_code, formatted_storage, formatted_display);
        
        super_admins_count := super_admins_count + 1;
    END LOOP;
    
    -- Retourner les résultats
    RETURN QUERY SELECT 'users'::TEXT, users_count;
    RETURN QUERY SELECT 'super_admins'::TEXT, super_admins_count;
    RETURN QUERY SELECT 'organizations'::TEXT, organizations_count;
    RETURN QUERY SELECT 'garages'::TEXT, garages_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour documenter les fonctions
COMMENT ON FUNCTION update_super_admin_phone IS 'Met à jour le numéro de téléphone d''un super_admin sans déclencher les triggers';
COMMENT ON FUNCTION get_formatted_phone_number IS 'Récupère un numéro de téléphone formaté depuis une table spécifique';
COMMENT ON FUNCTION validate_phone_number IS 'Valide et formate un numéro de téléphone selon le pays';
COMMENT ON FUNCTION migrate_all_phone_numbers IS 'Migre tous les numéros de téléphone existants vers le nouveau format';

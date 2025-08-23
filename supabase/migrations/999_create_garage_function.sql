-- Migration pour créer la fonction RPC create_garage
-- Cette fonction permet de créer un garage pour une organisation

-- Créer la fonction RPC create_garage
CREATE OR REPLACE FUNCTION public.create_garage(
  p_organization_id UUID,
  p_name TEXT,
  p_address TEXT,
  p_city TEXT,
  p_postal_code TEXT,
  p_country TEXT DEFAULT 'France',
  p_latitude DECIMAL(10, 8) DEFAULT NULL,
  p_longitude DECIMAL(11, 8) DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_garage_id UUID;
  v_result JSON;
BEGIN
  -- Vérifier que l'organisation existe
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = p_organization_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Organisation non trouvée'
    );
  END IF;

  -- Vérifier que l'utilisateur a accès à cette organisation
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_users 
    WHERE organization_id = p_organization_id 
    AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Accès non autorisé à cette organisation'
    );
  END IF;

  -- Créer le garage
  INSERT INTO public.garages (
    organization_id,
    name,
    address,
    city,
    postal_code,
    country,
    latitude,
    longitude,
    phone,
    email,
    description,
    created_by,
    updated_by
  ) VALUES (
    p_organization_id,
    p_name,
    p_address,
    p_city,
    p_postal_code,
    p_country,
    p_latitude,
    p_longitude,
    p_phone,
    p_email,
    p_description,
    auth.uid(),
    auth.uid()
  ) RETURNING id INTO v_garage_id;

  -- Retourner le résultat
  v_result := json_build_object(
    'success', true,
    'garage_id', v_garage_id,
    'message', 'Garage créé avec succès'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la création du garage: ' || SQLERRM
    );
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_garage TO authenticated;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.create_garage IS 'Fonction pour créer un garage dans une organisation';

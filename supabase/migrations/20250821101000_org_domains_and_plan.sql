-- ==========================================
-- Organisations: plan + domaines + slug + RPCs
-- ==========================================

-- 1) Enum pour plan d'organisation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_plan_type') THEN
    CREATE TYPE organization_plan_type AS ENUM ('free_trial', 'mensuel_standard', 'mensuel_pro', 'annuel_pro');
  END IF;
END $$;

-- 2) Colonnes organisations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='slug'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN slug text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='plan_type'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN plan_type organization_plan_type DEFAULT 'free_trial'::organization_plan_type;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='default_subdomain'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN default_subdomain text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='custom_domain'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN custom_domain text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='custom_domain_status'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN custom_domain_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='custom_domain_meta'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN custom_domain_meta jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 3) Contraintes/Index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_organizations_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_organizations_slug_unique ON public.organizations((lower(slug)));
  END IF;
END $$;

-- 4) Helper pour slugifier
CREATE OR REPLACE FUNCTION public.slugify(p_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v text := coalesce(p_input, '');
BEGIN
  v := lower(trim(v));
  v := translate(v, 'àâäçéèêëîïôöùûüñ', 'aaaceeeeii oouuun');
  v := regexp_replace(v, '[^a-z0-9]+', '-', 'g');
  v := regexp_replace(v, '(^-|-$)', '', 'g');
  IF v = '' THEN v := 'org'; END IF;
  RETURN v;
END;
$$;

-- 5) Génération de slug unique
CREATE OR REPLACE FUNCTION public.generate_unique_slug(p_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base text := public.slugify(p_name);
  candidate text := base;
  suffix int := 1;
BEGIN
  WHILE EXISTS(SELECT 1 FROM public.organizations WHERE lower(slug) = lower(candidate)) LOOP
    candidate := base || '-' || suffix::text;
    suffix := suffix + 1;
  END LOOP;
  RETURN candidate;
END;
$$;

-- 6) RPC provisioning organisation
CREATE OR REPLACE FUNCTION public.provision_organization(
  p_name text,
  p_email text,
  p_plan organization_plan_type,
  p_slug text DEFAULT NULL,
  p_custom_domain text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slug text;
  v_org_id uuid;
  v_subdomain text;
BEGIN
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nom organisation requis');
  END IF;

  v_slug := coalesce(nullif(trim(p_slug), ''), public.generate_unique_slug(p_name));
  v_subdomain := v_slug || '.garageconnect.com';

  INSERT INTO public.organizations(name, slug, address, plan_type, created_at)
  VALUES (p_name, v_slug, NULL, p_plan, now())
  RETURNING id INTO v_org_id;

  UPDATE public.organizations
  SET default_subdomain = v_subdomain
  WHERE id = v_org_id;

  IF p_custom_domain IS NOT NULL AND length(trim(p_custom_domain)) > 0 THEN
    UPDATE public.organizations
    SET custom_domain = p_custom_domain,
        custom_domain_status = 'pending',
        custom_domain_meta = jsonb_build_object('requested_at', now())
    WHERE id = v_org_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'organization_id', v_org_id, 'slug', v_slug, 'default_subdomain', v_subdomain);
EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.provision_organization(text, text, organization_plan_type, text, text) TO authenticated;



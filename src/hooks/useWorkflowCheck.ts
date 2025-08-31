// src/hooks/useWorkflowCheck.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowCheckState, WorkflowStep } from '@/types/workflow.types';

export function useWorkflowCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [workflowState, setWorkflowState] = useState<WorkflowCheckState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkWorkflowState = useCallback(async () => {
    try {
      setIsChecking(true);
      setError(null);
      console.log('🔍 Début vérification workflow...');

      // Vérifications de base avec Promise.all
      const [
        { data: hasSuperAdmin, error: superAdminError },
        { data: hasAdmin, error: adminError },
      ] = await Promise.all([
        supabase.rpc('check_super_admin_exists'),
        supabase.rpc('check_admin_exists'),
      ]);

      if (superAdminError || adminError) {
        throw superAdminError || adminError;
      }

      console.log('✅ Vérifications de base:', { hasSuperAdmin, hasAdmin });

      // Vérifications conditionnelles
      let hasPricingSelected = false;
      let hasOrganization = false;
      let hasSmsValidated = false;
      let hasGarage = false;
      let organizationData = null;

      if (hasAdmin) {
        // Vérifier le plan sélectionné
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminData } = await supabase
            .from('admins')
            .select('selected_plan_id')
            .eq('id', user.id)
            .single();

          hasPricingSelected = !!adminData?.selected_plan_id;
          console.log('✅ Plan sélectionné:', hasPricingSelected);
        }

        // Vérifier l'organisation si nécessaire
        try {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id, name, phone')
            .eq('is_active', true)
            .maybeSingle();

          if (orgData) {
            hasOrganization = true;
            organizationData = orgData;
            console.log('✅ Organisation trouvée:', orgData);

            // Vérifier la validation SMS
            const { data: smsData } = await supabase
              .from('sms_validations')
              .select('id')
              .eq('organization_id', orgData.id)
              .eq('is_used', true)
              .maybeSingle();

            hasSmsValidated = !!smsData;
            console.log('✅ SMS validé:', hasSmsValidated);

            // Vérifier le garage
            const { data: garageData } = await supabase
              .from('garages')
              .select('id')
              .eq('organization_id', orgData.id)
              .eq('is_active', true)
              .maybeSingle();

            hasGarage = !!garageData;
            console.log('✅ Garage existe:', hasGarage);
          }
        } catch (orgError) {
          console.warn('⚠️ Erreur vérification organisation:', orgError);
        }
      }

      // Construction de l'état final
      const workflowData: WorkflowCheckState = {
        has_super_admin: hasSuperAdmin,
        has_admin: hasAdmin,
        has_pricing_selected: hasPricingSelected, // Maintenant cette propriété est valide
        has_organization: hasOrganization,
        has_sms_validated: hasSmsValidated,
        has_garage: hasGarage,
        current_step: determineCurrentStep({ // Fonction helper pour déterminer l'étape
          has_super_admin: hasSuperAdmin,
          has_admin: hasAdmin,
          has_pricing_selected: hasPricingSelected,
          has_organization: hasOrganization,
          has_sms_validated: hasSmsValidated,
          has_garage: hasGarage
        }),
        is_completed: false,
        organization_id: organizationData?.id,
        organization_name: organizationData?.name,
        organization_phone: organizationData?.phone
      };

      console.log('📊 État workflow final:', workflowData);
      setWorkflowState(workflowData);

    } catch (err) {
      console.error('❌ Erreur vérification workflow:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { isChecking, workflowState, error, checkWorkflowState };
}

// Fonction helper pour déterminer l'étape courante
function determineCurrentStep(state: Partial<WorkflowCheckState>): WorkflowStep {
  if (!state.has_super_admin) return 'super_admin';
  if (!state.has_admin) return 'admin';
  if (!state.has_pricing_selected) return 'pricing';
  if (!state.has_organization) return 'organization';
  if (!state.has_sms_validated) return 'sms_validation';
  if (!state.has_garage) return 'garage';
  return 'completed';
}
// src/hooks/useWorkflowCheck.ts
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowCheckState, WorkflowStep } from '@/types/workflow.types';

export function useWorkflowCheck() {
  const [state, setState] = useState<WorkflowCheckState | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkWorkflowState = useCallback(async () => {
    try {
      setIsChecking(true);
      setError(null);
      console.log('🔍 Début vérification workflow...');

      // Vérifications de base avec Promise.all
      let hasSuperAdmin = false;
      let hasAdmin = false;

      try {
        const [
          { data: superAdminResult, error: superAdminError },
          { data: adminResult, error: adminError },
        ] = await Promise.all([
          supabase.rpc('check_super_admin_exists'),
          supabase.rpc('check_admin_exists'),
        ]);

        if (superAdminError) {
          console.warn('⚠️ Erreur vérification super admin:', superAdminError);
        } else {
          hasSuperAdmin = superAdminResult || false;
        }

        if (adminError) {
          console.warn('⚠️ Erreur vérification admin:', adminError);
        } else {
          hasAdmin = adminResult || false;
        }
      } catch (rpcError) {
        console.warn('⚠️ Erreur RPC, utilisation des valeurs par défaut:', rpcError);
        // En cas d'erreur RPC, on assume qu'il n'y a pas d'admin
        hasSuperAdmin = false;
        hasAdmin = false;
      }

      console.log('✅ Vérifications de base:', { hasSuperAdmin, hasAdmin });

      // Vérifications conditionnelles
      let hasPricingSelected = false;
      let hasOrganization = false;
      let hasSmsValidated = false;
      let hasGarage = false;
      let organizationData = null;

      if (hasAdmin) {
        try {
          // Vérifier le plan sélectionné
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            try {
              const { data: adminData } = await supabase
                .from('admins')
                .select('selected_plan_id')
                .eq('id', user.id)
                .single();

              hasPricingSelected = !!adminData?.selected_plan_id;
              console.log('✅ Plan sélectionné:', hasPricingSelected);
            } catch (adminError) {
              console.warn('⚠️ Erreur vérification plan admin:', adminError);
            }
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
              try {
                const { data: smsData } = await supabase
                  .from('sms_validations')
                  .select('id')
                  .eq('organization_id', orgData.id)
                  .eq('is_used', true)
                  .maybeSingle();

                hasSmsValidated = !!smsData;
                console.log('✅ SMS validé:', hasSmsValidated);
              } catch (smsError) {
                console.warn('⚠️ Erreur vérification SMS:', smsError);
              }

              // Vérifier le garage
              try {
                const { data: garageData } = await supabase
                  .from('garages')
                  .select('id')
                  .eq('organization_id', orgData.id)
                  .eq('is_active', true)
                  .maybeSingle();

                hasGarage = !!garageData;
                console.log('✅ Garage existe:', hasGarage);
              } catch (garageError) {
                console.warn('⚠️ Erreur vérification garage:', garageError);
              }
            }
          } catch (orgError) {
            console.warn('⚠️ Erreur vérification organisation:', orgError);
          }
        } catch (userError) {
          console.warn('⚠️ Erreur récupération utilisateur:', userError);
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

      // Sauvegarder l'état (optionnel, peut échouer si les tables n'existent pas)
      try {
        await supabase
          .from('workflow_states')
          .upsert({ ...workflowData });
        console.log('✅ État workflow sauvegardé');
      } catch (saveError) {
        console.warn('⚠️ Erreur sauvegarde état workflow:', saveError);
        // On continue même si la sauvegarde échoue
      }

      setState(workflowData);

    } catch (err) {
      console.error('❌ Erreur vérification workflow:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Effet pour vérifier l'état au chargement
  useEffect(() => {
    checkWorkflowState();
  }, []);

  return { isChecking, state, error, checkWorkflowState };
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
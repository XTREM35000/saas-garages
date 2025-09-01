// src/hooks/useWorkflowState.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowCheckState } from '@/types/workflow.types';

interface UseWorkflowStateResult {
  isChecking: boolean;
  workflowState: WorkflowCheckState | null;
  error: string | null;
  checkWorkflowState: () => Promise<void>;
}

export function useWorkflowState(): UseWorkflowStateResult {
  const [isChecking, setIsChecking] = useState(true);
  const [workflowState, setWorkflowState] = useState<WorkflowCheckState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkWorkflowState = useCallback(async () => {
    try {
      setIsChecking(true);
      setError(null);

      console.log('🔍 [useWorkflowCheck] Vérification état workflow...');

      // Appel des fonctions RPC individuelles qui existent déjà
      const [
        { data: hasSuperAdmin, error: superAdminError },
        { data: hasAdmin, error: adminError },
        { data: hasOrganization, error: orgError },
        { data: hasGarage, error: garageError }
      ] = await Promise.all([
        supabase.rpc('check_super_admin_exists'),
        supabase.rpc('check_admin_exists'),
        supabase.rpc('check_organization_exists'),
        supabase.rpc('check_garage_exists')
      ]);

      // Vérifier les erreurs
      if (superAdminError || adminError || orgError || garageError) {
        const error = superAdminError || adminError || orgError || garageError;
        console.error('❌ [useWorkflowCheck] Erreur RPC:', error);
        throw error;
      }

      // Vérification manuelle de la validation SMS
      let hasSmsValidated = false;
      let organizationId: string | null = null;
      let organizationName: string | null = null;
      let organizationPhone: string | null = null;

      try {
        // Récupérer l'organisation de l'admin connecté
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('organization_id')
          .limit(1)
          .single();

        if (!adminError && adminData) {
          organizationId = adminData.organization_id;

          // Récupérer les détails de l'organisation
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('name, phone, validated_at')
            .eq('id', organizationId)
            .single();

          if (!orgError && orgData) {
            organizationName = orgData.name;
            organizationPhone = orgData.phone;
            hasSmsValidated = orgData.validated_at !== null;
          }
        }
      } catch (err) {
        console.warn('⚠️ Impossible de vérifier la validation SMS:', err);
        // On continue sans bloquer le workflow
      }

      // Déterminer l'étape courante
      let current_step = 'completed';
      let is_completed = true;

      if (!hasSuperAdmin) {
        current_step = 'super_admin';
        is_completed = false;
      } else if (!hasAdmin) {
        current_step = 'admin';
        is_completed = false;
      } else if (!hasOrganization) {
        current_step = 'organization';
        is_completed = false;
      } else if (!hasSmsValidated) {
        current_step = 'sms_validation';
        is_completed = false;
      } else if (!hasGarage) {
        current_step = 'garage';
        is_completed = false;
      }

      const workflowData: WorkflowCheckState = {
        has_super_admin: hasSuperAdmin || false,
        has_admin: hasAdmin || false,
        has_pricing_selected: true, // Par défaut à true pour éviter les erreurs
        has_organization: hasOrganization || false,
        has_sms_validated: hasSmsValidated,
        has_garage: hasGarage || false,
        current_step: current_step as any,
        is_completed,
        organization_id: organizationId || undefined,
        organization_name: organizationName || undefined,
        organization_phone: organizationPhone || undefined
      };

      console.log('✅ [useWorkflowCheck] État workflow:', workflowData);
      setWorkflowState(workflowData);

    } catch (err: any) {
      console.error('❌ [useWorkflowCheck] Erreur:', err);
      const errorMessage = err.message || 'Erreur de vérification du workflow';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Vérification initiale
  useEffect(() => {
    checkWorkflowState();
  }, [checkWorkflowState]);

  return {
    isChecking,
    workflowState,
    error,
    checkWorkflowState
  };
}
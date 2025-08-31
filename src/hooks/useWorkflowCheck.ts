import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowCheckState {
  has_super_admin: boolean;
  has_admin: boolean;
  has_organization: boolean;
  has_garage: boolean;
  current_step: string;
  is_completed: boolean;
}

interface UseWorkflowCheckResult {
  isChecking: boolean;
  workflowState: WorkflowCheckState | null;
  error: string | null;
  checkWorkflowState: () => Promise<void>;
}

export function useWorkflowCheck(): UseWorkflowCheckResult {
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
      } else if (!hasGarage) {
        current_step = 'garage';
        is_completed = false;
      }

      const workflowData: WorkflowCheckState = {
        has_super_admin: hasSuperAdmin || false,
        has_admin: hasAdmin || false,
        has_organization: hasOrganization || false,
        has_garage: hasGarage || false,
        current_step,
        is_completed
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
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

      // Appel de la fonction RPC pour obtenir l'état complet
      const { data, error: rpcError } = await supabase
        .rpc('get_workflow_state') as { data: WorkflowCheckState | null, error: any };

      if (rpcError) {
        console.error('❌ [useWorkflowCheck] Erreur RPC:', rpcError);
        throw rpcError;
      }

      console.log('✅ [useWorkflowCheck] État workflow:', data);
      setWorkflowState(data);

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
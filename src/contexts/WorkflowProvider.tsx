import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  WorkflowState,
  WorkflowStep,
  DBWorkflowState,
  WorkflowContextType,
  getNextStep
} from '@/types/workflow.types';
declare const RTCError: undefined;

export const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);


const initialState: WorkflowState = {
  currentStep: 'super_admin_check',
  completedSteps: [],
  isDemo: false,
  loading: false,
  error: null
};

// Helper pour les erreurs courantes
const handleSupabaseError = (error: any) => {
  if (error.code === '42501') {
    return {
      shouldRetry: false,
      userMessage: 'Vous ne disposez pas des permissions nécessaires'
    };
  }
  // Ajouter d'autres codes d'erreur au besoin
  return {
    shouldRetry: true,
    userMessage: 'Erreur temporaire, veuillez réessayer'
  };
};

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkflowState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthSession();

  // Synchronisation avec Supabase
  // interface WorkflowState {9
  const syncState = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('workflow_states')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const workflowData = data as DBWorkflowState;
        setState({
          currentStep: workflowData.current_step as WorkflowStep,
          completedSteps: workflowData.completed_steps || [],
          lastActiveOrg: typeof workflowData.metadata === 'object' && workflowData.metadata !== null
            ? (workflowData.metadata as Record<string, any>).lastActiveOrg
            : undefined,
          isDemo: typeof workflowData.metadata === 'object' && workflowData.metadata !== null
            ? Boolean((workflowData.metadata as Record<string, any>).isDemo)
            : false,
          userId: workflowData.user_id,
          loading: false,
          error: null,
          metadata: typeof workflowData.metadata === 'object' && workflowData.metadata !== null
            ? (workflowData.metadata as Record<string, any>)
            : {}
        });
      } else {
        await createInitialState();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de synchronisation');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Créer l'état initial
  const createInitialState = async () => {
    if (!user?.id) return;

    try {
      // Vérifier si c'est un super admin
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');

      const newState = {
        ...initialState,
        userId: user.id,
        currentStep: isSuperAdmin ? ('pricing_selection' as WorkflowStep) : ('super_admin_check' as WorkflowStep)
      };

      const { error: insertError } = await supabase
        .from('workflow_states')
        .insert({
          user_id: user.id,
          current_step: newState.currentStep,
          completed_steps: newState.completedSteps,
          meta: { isDemo: newState.isDemo }
        });

      if (insertError) throw insertError;

      setState(newState);
      console.log('✅ [WorkflowProvider] État initial créé:', newState);
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur création état:', err);
      setError(err instanceof Error ? err.message : 'Erreur de création');
    }
  };

  // Compléter une étape
  const completeStep = useCallback(async (step: WorkflowStep) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const nextStep = getNextStep(step);
      const newCompletedSteps = [...state.completedSteps];

      if (!newCompletedSteps.includes(step)) {
        newCompletedSteps.push(step);
      }

      const { error: updateError } = await supabase
        .from('workflow_states')
        .upsert({
          user_id: user.id,
          current_step: nextStep,
          completed_steps: newCompletedSteps,
          metadata: {
            ...state.metadata,
            lastUpdate: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setState(prev => ({
        ...prev,
        currentStep: nextStep,
        completedSteps: newCompletedSteps
      }));

    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur progression:', err);
      setError(err instanceof Error ? err.message : 'Erreur de progression');
    } finally {
      setIsLoading(false);
    }
  }, [state, user?.id]);

  // Validation flexible des champs
  const validateFormField = useCallback((field: string, value: string) => {
    switch (field) {
      case 'email':
        // Validation souple : 2 caractères minimum, @ optionnel
        const isValid = value.length >= 2;
        return {
          isValid,
          error: isValid ? undefined : 'Email trop court (min 2 caractères)'
        };
      case 'password':
        const passwordValid = value.length >= 8;
        return {
          isValid: passwordValid,
          error: passwordValid ? undefined : 'Mot de passe trop court (min 8 caractères)'
        };
      case 'name':
        const nameValid = value.trim().length > 0;
        return {
          isValid: nameValid,
          error: nameValid ? undefined : 'Nom requis'
        };
      case 'phone':
        const phoneValid = /^\+?\d{8,15}$/.test(value);
        return {
          isValid: phoneValid,
          error: phoneValid ? undefined : 'Numéro de téléphone invalide'
        };
      default:
        return { isValid: true };
    }
  }, []);

  // Reset workflow
  const reset = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('workflow_states')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setState(initialState);
      console.log('🔄 [WorkflowProvider] Workflow réinitialisé');
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur reset:', err);
      setError(err instanceof Error ? err.message : 'Erreur de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Sync automatique au changement d'utilisateur
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      syncState();
    } else if (!isAuthenticated) {
      setState(initialState);
      setIsLoading(false);
      setError(null);
    }
  }, [isAuthenticated, user?.id, syncState]);

  const contextValue: WorkflowContextType = {
    state,
    completeStep,
    reset,
    isLoading,
    error,
    validateFormField
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
}

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

const createWorkflowState = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workflow_states')
      .insert({
        user_id: userId,
        current_step: 'init',
        completed_steps: [],
        is_completed: false,
        metadata: {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (err) {
    console.error('❌ [WorkflowProvider] Erreur création état:', err);
    throw err;
  }
};
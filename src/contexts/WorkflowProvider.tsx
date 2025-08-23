import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  WorkflowState,
  WorkflowStep,
  DBWorkflowState,
  WorkflowContextType
} from '@/types/workflow.types';

export const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const initialState: WorkflowState = {
  currentStep: 'super_admin_check',
  completedSteps: [],
  isDemo: false,
  loading: false,
  error: null
};

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkflowState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthSession();

  // Vérifier l'existence d'un super admin
  const checkSuperAdminExists = useCallback(async () => {
    try {
      const { data: superAdmins, error } = await supabase
        .from('super_admins')
        .select('*')
        .eq('est_actif', true);

      if (error) {
        console.error('❌ [WorkflowProvider] Erreur vérification super admin:', error);
        return false;
      }

      const hasSuperAdmin = superAdmins && superAdmins.length > 0;
      console.log('✅ [WorkflowProvider] Vérification super admin:', hasSuperAdmin ? 'Trouvé' : 'Non trouvé');
      return hasSuperAdmin;
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur inattendue:', err);
      return false;
    }
  }, []);

  // Créer l'état initial du workflow
  const createInitialState = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 [WorkflowProvider] Création de l\'état initial...');

      // Vérifier s'il existe déjà un super admin
      const hasSuperAdmin = await checkSuperAdminExists();

      let currentStep: WorkflowStep;
      let completedSteps: WorkflowStep[];

      if (hasSuperAdmin) {
        // Si un super admin existe, passer directement à l'étape pricing
        currentStep = 'pricing_selection';
        completedSteps = ['super_admin_check'];
        console.log('✅ [WorkflowProvider] Super admin trouvé, passage direct à pricing_selection');
      } else {
        // Aucun super admin, commencer par la création
        currentStep = 'super_admin_check';
        completedSteps = [];
        console.log('ℹ️ [WorkflowProvider] Aucun super admin, création nécessaire');
      }

      const newState = {
        ...initialState,
        userId: user.id,
        currentStep,
        completedSteps
      };

      // Sauvegarder dans Supabase
      const { error: insertError } = await supabase
        .from('workflow_states')
        .insert({
          user_id: user.id,
          current_step: newState.currentStep,
          completed_steps: newState.completedSteps,
          meta: { isDemo: newState.isDemo }
        });

      if (insertError) {
        console.error('❌ [WorkflowProvider] Erreur insertion workflow state:', insertError);
        throw insertError;
      }

      setState(newState);
      console.log('✅ [WorkflowProvider] État initial créé et sauvegardé:', newState);
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur création état initial:', err);
      setError(err instanceof Error ? err.message : 'Erreur de création');
    }
  }, [user?.id, checkSuperAdminExists]);

  // Synchronisation avec Supabase
  const syncState = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 [WorkflowProvider] Synchronisation avec Supabase...');

      // Vérifier s'il existe déjà un état de workflow pour cet utilisateur
      const { data, error: fetchError } = await supabase
        .from('workflow_states')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        // État existant trouvé, l'utiliser
        const workflowData = data as DBWorkflowState;
        console.log('📋 [WorkflowProvider] État existant trouvé:', workflowData);

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
        // Aucun état existant, créer un nouvel état initial
        console.log('🆕 [WorkflowProvider] Aucun état existant, création d\'un nouvel état...');
        await createInitialState();
      }
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur synchronisation:', err);
      setError(err instanceof Error ? err.message : 'Erreur de synchronisation');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, createInitialState]);

  // Interface pour la table workflow_states
  interface WorkflowStateInsert {
    current_step: string;
    user_id: string;
    completed_steps?: string[];
    metadata?: Record<string, any>;
    updated_at?: string;
    created_at?: string;
    is_completed?: boolean;
  }

  // Fonction pour créer ou mettre à jour l'état du workflow
  const createOrUpdateWorkflowState = useCallback(async (workflowData: Partial<WorkflowStateInsert>) => {
    if (!user?.id) return;

    try {
      const dataToUpsert: WorkflowStateInsert = {
        user_id: user.id,
        current_step: workflowData.current_step || 'super_admin_check',
        completed_steps: workflowData.completed_steps || [],
        metadata: {
          ...(state.metadata || {}),
          lastUpdate: new Date().toISOString(),
          ...(workflowData.metadata || {})
        },
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('workflow_states')
        .upsert(dataToUpsert)
        .select()
        .single();

      if (error) {
        console.error('❌ [WorkflowProvider] Erreur upsert:', error);
        throw error;
      }

      console.log('✅ [WorkflowProvider] Workflow mis à jour:', data);
      return data;
    } catch (error) {
      console.error('❌ [WorkflowProvider] Erreur mise à jour workflow:', error);
      throw error;
    }
  }, [user?.id, state.metadata]);

  // Compléter une étape et passer à la suivante
  const completeStep = useCallback(async (step: WorkflowStep) => {
    if (!user?.id) return;

    try {
      console.log('🎯 [WorkflowProvider] Complétion étape:', step);

      // Ajouter l'étape aux étapes complétées
      const newCompletedSteps = [...state.completedSteps, step];

      // Déterminer la prochaine étape selon la logique du workflow
      let nextStep: WorkflowStep;

      switch (step) {
        case 'super_admin_check':
          nextStep = 'pricing_selection';
          break;
        case 'pricing_selection':
          nextStep = 'admin_creation';
          break;
        case 'admin_creation':
          nextStep = 'org_creation';
          break;
        case 'org_creation':
          nextStep = 'garage_setup';
          break;
        case 'garage_setup':
          nextStep = 'completed';
          break;
        default:
          nextStep = 'completed';
      }

      // Mettre à jour l'état local
      const newState = {
        ...state,
        currentStep: nextStep,
        completedSteps: newCompletedSteps
      };

      setState(newState);

      // Sauvegarder dans Supabase
      await createOrUpdateWorkflowState({
        current_step: nextStep,
        completed_steps: newCompletedSteps,
        metadata: {
          lastCompletedStep: step,
          completedAt: new Date().toISOString()
        }
      });

      console.log('✅ [WorkflowProvider] Étape complétée, passage à:', nextStep);

      // Si c'est la dernière étape, marquer comme terminé
      if (nextStep === 'completed') {
        await createOrUpdateWorkflowState({
          current_step: 'completed',
          completed_steps: newCompletedSteps,
          metadata: {
            ...newState.metadata,
            completedAt: new Date().toISOString(),
            is_completed: true
          }
        });
      }

    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur complétion étape:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la complétion');
    }
  }, [user?.id, state, createOrUpdateWorkflowState]);

  // Validation flexible des champs
  const validateFormField = useCallback((field: string, value: string) => {
    switch (field) {
      case 'email':
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

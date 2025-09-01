// src/stores/workflowStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import {
  WorkflowStep,
  WorkflowState,
  AdminCredentials,
  PlanDetails,
  OrganizationData,
  GarageSetupData,
  SmsValidationData
} from '@/types/workflow.types';

interface WorkflowStore {
  // État du workflow
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;

  // Données des étapes
  adminCredentials: AdminCredentials | null;
  selectedPlan: PlanDetails | null;
  organizationData: OrganizationData | null;
  smsValidationData: SmsValidationData | null;
  garageSetupData: GarageSetupData | null;

  // Actions
  setCurrentStep: (step: WorkflowStep) => void;
  completeStep: (step: WorkflowStep, data?: any) => Promise<void>;
  resetWorkflow: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Actions spécifiques aux étapes
  setAdminCredentials: (credentials: AdminCredentials) => void;
  setSelectedPlan: (plan: PlanDetails) => void;
  setOrganizationData: (data: OrganizationData) => void;
  setSmsValidationData: (data: SmsValidationData) => void;
  setGarageSetupData: (data: GarageSetupData) => void;

  // Persistence
  loadWorkflowState: () => Promise<void>;
  saveWorkflowState: () => Promise<void>;

  // Validation
  validateStep: (step: WorkflowStep) => boolean;
  canProceedToStep: (step: WorkflowStep) => boolean;
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      // État initial
      currentStep: 'super_admin',
      completedSteps: [],
      isCompleted: false,
      isLoading: false,
      error: null,

      // Données initiales
      adminCredentials: null,
      selectedPlan: null,
      organizationData: null,
      smsValidationData: null,
      garageSetupData: null,

      // Actions principales
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      completeStep: async (step, data) => {
        const { completedSteps, saveWorkflowState } = get();

        // Ajouter l'étape aux étapes complétées
        const newCompletedSteps = [...new Set([...completedSteps, step])];

        // Sauvegarder les données spécifiques à l'étape
        if (data) {
          switch (step) {
            case 'admin':
              get().setAdminCredentials(data);
              break;
            case 'pricing':
              get().setSelectedPlan(data);
              break;
            case 'organization':
              get().setOrganizationData(data);
              break;
            case 'sms_validation':
              get().setSmsValidationData(data);
              break;
            case 'garage':
              get().setGarageSetupData(data);
              break;
          }
        }

        // Mettre à jour l'état
        set({
          completedSteps: newCompletedSteps,
          error: null
        });

        // Déterminer la prochaine étape
        const nextStep = getNextStep(step);
        if (nextStep) {
          set({ currentStep: nextStep });
        } else {
          set({ isCompleted: true });
        }

        // Sauvegarder en base
        await saveWorkflowState();
      },

      resetWorkflow: async () => {
        set({
          currentStep: 'super_admin',
          completedSteps: [],
          isCompleted: false,
          error: null,
          adminCredentials: null,
          selectedPlan: null,
          organizationData: null,
          smsValidationData: null,
          garageSetupData: null,
        });

        // Nettoyer la base de données
        try {
          await supabase.from('workflow_states').delete().neq('id', '');
        } catch (error) {
          console.error('Erreur lors du reset:', error);
        }
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Actions spécifiques aux étapes
      setAdminCredentials: (credentials) => set({ adminCredentials: credentials }),
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      setOrganizationData: (data) => set({ organizationData: data }),
      setSmsValidationData: (data) => set({ smsValidationData: data }),
      setGarageSetupData: (data) => set({ garageSetupData: data }),

      // Persistence
      loadWorkflowState: async () => {
        set({ isLoading: true, error: null });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data: workflowState } = await supabase
            .from('workflow_states')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (workflowState) {
            set({
              currentStep: workflowState.current_step,
              completedSteps: workflowState.completed_steps || [],
              isCompleted: workflowState.is_completed,
              adminCredentials: workflowState.metadata?.adminCredentials || null,
              selectedPlan: workflowState.metadata?.selectedPlan || null,
              organizationData: workflowState.metadata?.organizationData || null,
              smsValidationData: workflowState.metadata?.smsValidationData || null,
              garageSetupData: workflowState.metadata?.garageSetupData || null,
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement:', error);
          set({ error: 'Erreur lors du chargement du workflow' });
        } finally {
          set({ isLoading: false });
        }
      },

      saveWorkflowState: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const state = get();
          const metadata = {
            adminCredentials: state.adminCredentials,
            selectedPlan: state.selectedPlan,
            organizationData: state.organizationData,
            smsValidationData: state.smsValidationData,
            garageSetupData: state.garageSetupData,
          };

          await supabase
            .from('workflow_states')
            .upsert({
              user_id: user.id,
              current_step: state.currentStep,
              completed_steps: state.completedSteps,
              is_completed: state.isCompleted,
              metadata,
              updated_at: new Date().toISOString(),
            });
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
          set({ error: 'Erreur lors de la sauvegarde du workflow' });
        }
      },

      // Validation
      validateStep: (step) => {
        const state = get();

        switch (step) {
          case 'super_admin':
            return true; // Toujours valide
          case 'admin':
            return state.completedSteps.includes('super_admin');
          case 'pricing':
            return state.completedSteps.includes('admin') && !!state.adminCredentials;
          case 'organization':
            return state.completedSteps.includes('pricing') && !!state.selectedPlan;
          case 'sms_validation':
            return state.completedSteps.includes('organization') && !!state.organizationData;
          case 'garage':
            return state.completedSteps.includes('sms_validation') && !!state.smsValidationData;
          case 'completed':
            return state.completedSteps.includes('garage') && !!state.garageSetupData;
          default:
            return false;
        }
      },

      canProceedToStep: (step) => {
        const state = get();
        const stepOrder: WorkflowStep[] = [
          'super_admin',
          'admin',
          'pricing',
          'organization',
          'sms_validation',
          'garage',
          'completed'
        ];

        const currentIndex = stepOrder.indexOf(state.currentStep);
        const targetIndex = stepOrder.indexOf(step);

        return targetIndex <= currentIndex + 1;
      },
    }),
    {
      name: 'workflow-store',
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        isCompleted: state.isCompleted,
        adminCredentials: state.adminCredentials,
        selectedPlan: state.selectedPlan,
        organizationData: state.organizationData,
        smsValidationData: state.smsValidationData,
        garageSetupData: state.garageSetupData,
      }),
    }
  )
);

// Fonction helper pour obtenir la prochaine étape
function getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const stepOrder: WorkflowStep[] = [
    'super_admin',
    'admin',
    'pricing',
    'organization',
    'sms_validation',
    'garage',
    'completed'
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }

  return stepOrder[currentIndex + 1];
} 
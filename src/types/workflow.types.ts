// src/types/workflow.types.ts
import { Json } from './database.types';

export type WorkflowStep =
  | 'init'
  | 'loading'
  | 'super_admin_check'
  | 'pricing_selection'
  | 'admin_creation'
  | 'org_creation'
  | 'garage_setup'
  | 'sms_validation'
  | 'dashboard'
  | 'completed';

// Type pour l'état en base de données
export interface DBWorkflowState {
  id: string;
  user_id: string;
  current_step: WorkflowStep;
  completed_steps: WorkflowStep[];
  is_completed: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

// Type pour l'état dans le contexte React
export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  isDemo: boolean;
  loading: boolean;
  error: string | null;
  userId?: string;
  metadata?: Record<string, any>;
  lastActiveOrg?: string | null;
}

export interface WorkflowContextType {
  state: WorkflowState;
  completeStep: (step: WorkflowStep) => Promise<void>;
  reset: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  validateFormField: (field: string, value: string) => {
    isValid: boolean;
    error?: string;
  };
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  'init',
  'super_admin_check',
  'pricing_selection',
  'admin_creation',
  'org_creation',
  'garage_setup',
  'sms_validation',
  'completed'
];

export const getNextStep = (currentStep: WorkflowStep): WorkflowStep => {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);

  if (currentIndex === -1 || currentIndex === WORKFLOW_STEPS.length - 1) {
    return 'completed';
  }

  return WORKFLOW_STEPS[currentIndex + 1];
};

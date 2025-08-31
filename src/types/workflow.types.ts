// src/types/workflow.types.ts
import { Json } from './database.types';
import { ComponentType } from 'react';
// Define IconType here if '@/types/common.types' cannot be resolved
export type IconType = React.ComponentType<{ size?: number; color?: string }>;

// Define IconType here if './common.types' does not exist or is misplaced
export type WorkflowStep =
  | 'super_admin_check'
  | 'pricing_selection'
  | 'admin_creation'
  | 'org_creation'
  | 'sms_validation'
  | 'garage_setup'
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

export interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onLoginSuccess?: (data: { user: any; profile: any }) => void;
}

export interface WorkflowStepConfig {
  id: string;
  title: string;
  name: string;
  description: string;
  component: ComponentType<any>; // Plus flexible pour les props spécifiques
  order: number;
  icon: any; // Nous utiliserons le type IconType plus tard
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  'super_admin_check',
  'pricing_selection',
  'admin_creation',
  'org_creation',
  'sms_validation',
  'garage_setup',
  'completed'
];

export const getNextStep = (currentStep: WorkflowStep): WorkflowStep | null => {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);

  if (currentIndex === -1 || currentIndex === WORKFLOW_STEPS.length - 1) {
    return null;
  }

  return WORKFLOW_STEPS[currentIndex + 1];
};

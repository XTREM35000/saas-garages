// Types de workflow unifiés
export type WorkflowStep =
  | 'super_admin_check'
  | 'pricing_selection'
  | 'admin_creation'
  | 'org_creation'
  | 'sms_validation'
  | 'garage_setup'
  | 'completed';

// src/types/workflow.types.ts
export interface WorkflowCheckState {
  has_super_admin: boolean;
  has_admin: boolean;
  has_organization: boolean;
  has_sms_validated: boolean; // Cette propriété doit exister
  has_garage: boolean;
  current_step: string;
  is_completed: boolean;
  organization_id?: string;
  organization_name?: string;
  organization_phone?: string;
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
  component: any;
  order: number;
  icon: any;
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
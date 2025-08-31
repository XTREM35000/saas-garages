// Types de workflow unifiés
export type WorkflowStep =
  | 'super_admin'
  | 'auth'
  | 'pricing'
  | 'admin'
  | 'organization'
  | 'sms'
  | 'garage'
  | 'dashboard';

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
  component: any;
  order: number;
  icon: any;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  'super_admin',
  'auth',
  'pricing',
  'admin',
  'organization',
  'sms',
  'garage',
  'dashboard'
];

export const getNextStep = (currentStep: WorkflowStep): WorkflowStep | null => {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
  
  if (currentIndex === -1 || currentIndex === WORKFLOW_STEPS.length - 1) {
    return null;
  }
  
  return WORKFLOW_STEPS[currentIndex + 1];
};
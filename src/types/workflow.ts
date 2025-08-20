export const WORKFLOW_STEPS = {
  LOADING: 'loading',
  SUPER_ADMIN: 'super-admin',
  PRICING: 'pricing',
  CREATE_ADMIN: 'create-admin',
  CREATE_ORGANIZATION: 'create-organization',
  SMS_VALIDATION: 'sms-validation',
  GARAGE_SETUP: 'garage-setup',
  COMPLETE: 'complete'
} as const;

export type WorkflowMode = 'super_admin' | 'tenant' | 'admin';

export type WorkflowStep =
  | 'super_admin_check'
  | 'pricing_selection'
  | 'admin_creation'
  | 'org_creation'
  | 'sms_validation'
  | 'garage_setup'
  | 'dashboard';

export interface WorkflowState {
  id: string;
  user_id: string;
  current_step: string;
  completed_steps: string[];
  is_completed: boolean;
  metadata: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowContextType {
  state: WorkflowState;
  currentStep: WorkflowStep;
  steps: Array<{ id: WorkflowStep; status: string }>;
  completeStep: (step: WorkflowStep) => Promise<void>;
  goToStep: (step: WorkflowStep) => Promise<void>;
  canGoToStep: (step: WorkflowStep) => boolean;
  reset: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const WORKFLOW_STEP_ORDER: readonly WorkflowStep[] = [
  'super_admin_check',
  'pricing_selection',
  'admin_creation',
  'org_creation',
  'sms_validation',
  'garage_setup',
  'dashboard'
] as const;

export const getNextStep = (currentStep: WorkflowStep): WorkflowStep => {
  const currentIndex = WORKFLOW_STEP_ORDER.indexOf(currentStep);
  return WORKFLOW_STEP_ORDER[currentIndex + 1] || 'dashboard';
};

export const isValidWorkflowStep = (step: unknown): step is WorkflowStep => {
  return typeof step === 'string' && WORKFLOW_STEP_ORDER.includes(step as WorkflowStep);
};

export const parseWorkflowState = (data: any): WorkflowState => {
  return {
    id: data.id,
    user_id: data.user_id,
    current_step: isValidWorkflowStep(data.current_step) ? data.current_step : 'super_admin_check',
    completed_steps: Array.isArray(data.completed_steps) ? data.completed_steps : [],
    is_completed: Boolean(data.is_completed),
    metadata: data.meta || {},
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};
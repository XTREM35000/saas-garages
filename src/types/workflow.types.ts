// src/types/workflow.types.ts
import { Json } from './database.types';
import { ComponentType } from 'react';
// Define IconType here if '@/types/common.types' cannot be resolved
export type IconType = React.ComponentType<{ size?: number; color?: string }>;

// Define IconType here if './common.types' does not exist or is misplaced
export type WorkflowStep =
  | 'super_admin'
  | 'admin'
  | 'pricing'
  | 'organization'
  | 'sms_validation'
  | 'garage'
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
  has_super_admin: boolean;
  has_admin: boolean;
  has_pricing_selected: boolean;
  has_organization: boolean;
  has_sms_validated: boolean;
  has_garage: boolean;
  current_step: WorkflowStep;
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
  component: ComponentType<any>; // Plus flexible pour les props spécifiques
  order: number;
  icon: any; // Nous utiliserons le type IconType plus tard
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  'super_admin',
  'admin',
  'pricing',
  'organization',
  'sms_validation',
  'garage'
];

export const getNextStep = (currentStep: WorkflowStep): WorkflowStep | null => {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);

  if (currentIndex === -1 || currentIndex === WORKFLOW_STEPS.length - 1) {
    return null;
  }

  return WORKFLOW_STEPS[currentIndex + 1];
};

export interface AdminData {
  email: string;
  password: string;
  [key: string]: any;
}

export interface OptimizedWorkflowWizardProps {
  isOpen: boolean;
  onComplete: (step: WorkflowStep) => Promise<void>;
  workflowState: WorkflowCheckState | null; // Changé de initialState à workflowState
}

export interface WorkflowCheckState {
  has_super_admin: boolean;
  has_admin: boolean;
  has_pricing_selected: boolean;
  has_organization: boolean;
  has_sms_validated: boolean;
  has_garage: boolean;
  current_step: WorkflowStep;
  is_completed: boolean;
  organization_id?: string;
  organization_name?: string;
  organization_phone?: string;
}

export interface AdminCreationModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
  selectedPlan: PlanDetails | null; // Changement ici : accepte PlanDetails au lieu de string
}

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: IconType;
  buttonColors: {
    bg: string;
    hover: string;
    text: string;
  };
  cardGradient: string;
}

export type PlanType = 'free' | 'monthly' | 'annual' | 'license';

export interface PlanDetails {
  id: string;
  name: string;
  price: string;
  duration: number;
  features: string[];
  type: 'free' | 'monthly' | 'annual' | 'license'; // Type de plan
  limitations: string[];    // Limitations éventuelles
  selected_at: string;      // Date de sélection au format ISO
}

export interface PricingModalProps {
  isOpen: boolean;
  onSelectPlan: (plan: PlanDetails) => Promise<void>;
}

export interface WorkflowData {
  currentStep: string;
  planDetails?: PlanDetails;
  organizationData?: any;
  validationData?: any;
}

export interface WorkflowStateProps {
  workflowState: WorkflowCheckState | null;
  isChecking: boolean;
  error: string | null;
  checkWorkflowState: () => Promise<void>;
}

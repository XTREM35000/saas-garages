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

export interface AdminCredentials {
  email: string;
  password: string;
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
  onComplete: (data: AdminCredentials) => Promise<void>; // Mise à jour de la signature
  onClose: () => void;
  selectedPlan?: PlanDetails;
}

export type PlanType = 'free' | 'monthly' | 'annual' | 'license';

export interface PlanDetails {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  type: PlanType;
  selected_at: string;
}

export interface PricingModalProps {
  isOpen: boolean;
  onSelectPlan: (planDetails: PlanDetails) => Promise<void>; <void>;
adminCredentials ?: AdminCredentials;
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

export interface OrganizationSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  selectedPlan: PlanDetails | null;
}

// Nouvelles interfaces pour les données des étapes
export interface OrganizationData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface SmsValidationData {
  id: string;
  organization_id: string;
  phone_number: string;
  validation_code: string;
  is_validated: boolean;
  validated_at: string;
  created_at: string;
}

export interface GarageSetupData {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  manager_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface pour les données de validation des formulaires
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Interface pour les props communes des modaux
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data?: any) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Interface pour les données de progression
export interface WorkflowProgress {
  currentStep: WorkflowStep;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  canProceed: boolean;
  canGoBack: boolean;
}

import React from 'react';
import { WorkflowStep } from '@/types/workflow.d';

// Adaptateur pour convertir les anciens steps vers les nouveaux
const STEP_MAPPING: Record<string, WorkflowStep> = {
  'super_admin_check': 'super_admin',
  'pricing_selection': 'pricing', 
  'admin_creation': 'admin',
  'org_creation': 'organization',
  'sms_validation': 'sms',
  'garage_setup': 'garage',
  'dashboard': 'dashboard'
};

interface SimpleWorkflowAdapterProps {
  children: React.ReactNode;
}

export const SimpleWorkflowAdapter: React.FC<SimpleWorkflowAdapterProps> = ({ 
  children 
}) => {
  // Ce composant sert juste d'adaptateur pour les anciens types
  return <>{children}</>;
};

export const mapLegacyStep = (oldStep: string): WorkflowStep => {
  return STEP_MAPPING[oldStep] || 'dashboard';
};

export default SimpleWorkflowAdapter;
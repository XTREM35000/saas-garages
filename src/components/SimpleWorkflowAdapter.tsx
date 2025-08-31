import React from 'react';
import { WorkflowStep } from '@/types/workflow.d';

// Adaptateur pour convertir les anciens steps vers les nouveaux
const STEP_MAPPING: Record<string, WorkflowStep> = {
  'super_admin': 'super_admin_check',
  'pricing': 'pricing_selection', 
  'admin': 'admin_creation',
  'organization': 'org_creation',
  'sms': 'sms_validation',
  'garage': 'garage_setup',
  'dashboard': 'completed'
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
  return STEP_MAPPING[oldStep] || 'completed';
};

export default SimpleWorkflowAdapter;
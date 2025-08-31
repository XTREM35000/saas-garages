import React from 'react';
import OptimizedWorkflowWizard from '@/components/OptimizedWorkflowWizard';

interface NewInitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const NewInitializationWizard: React.FC<NewInitializationWizardProps> = ({
  isOpen,
  onComplete
}) => {
  return (
    <OptimizedWorkflowWizard
      isOpen={isOpen}
      onComplete={onComplete}
    />
  );
};

export default NewInitializationWizard;
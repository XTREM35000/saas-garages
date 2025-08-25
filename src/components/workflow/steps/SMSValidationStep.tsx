import SmsValidationModal from '@/components/SmsValidationModal';
import React, { useState } from 'react';

// Define or import WorkflowStepProps
type WorkflowStepProps = {
  onComplete: () => Promise<void>;
};

export const SMSValidationStep: React.FC<WorkflowStepProps> = ({
  onComplete
}) => {
  const [showModal, setShowModal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleValidation = async (code: string) => {
    setIsLoading(true);
    try {
      // Votre logique de validation
      await onComplete();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Replace the placeholder values with actual data as needed
  const organizationName = "Your Organization";
  const organizationCode = "ORG123";
  const adminName = "Admin Name";

  return (
    <SmsValidationModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onSubmit={handleValidation}
      isLoading={isLoading}
      onComplete={onComplete}
      organizationName={organizationName}
      organizationCode={organizationCode}
      adminName={adminName}
    />
  );
};
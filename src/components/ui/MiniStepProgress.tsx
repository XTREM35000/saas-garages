import React from 'react';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/types/workflow.types';

interface MiniStepProgressProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  totalSteps?: number;
  className?: string;
}

const ORDER: WorkflowStep[] = [
  'super_admin',
  'pricing',
  'admin',
  'organization',
  'sms_validation',
  'garage',
  'completed'
];

export const MiniStepProgress: React.FC<MiniStepProgressProps> = ({
  currentStep,
  completedSteps,
  totalSteps = 6,
  className
}) => {
  const effectiveTotal = totalSteps;
  const completedCount = Math.min(completedSteps.length, effectiveTotal);
  const percentage = Math.round((completedCount / effectiveTotal) * 100);

  return (
    <div className={cn('w-full flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-[#128C7E]/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#128C7E] to-[#25D366] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[11px] font-medium text-[#075E54] min-w-[2.5rem] text-right">
        {percentage}%
      </span>
    </div>
  );
};

export default MiniStepProgress;



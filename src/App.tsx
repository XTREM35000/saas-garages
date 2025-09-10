// src/App.tsx
import React from 'react';
import { Toaster } from 'sonner';
import { WorkflowProvider } from '@/contexts/WorkflowProvider';
import OptimizedWorkflowWizard from '@/components/OptimizedWorkflowWizard';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <WorkflowProvider>
        <OptimizedWorkflowWizard
          isOpen={true}
          onComplete={() => console.log('Workflow completed!')}
        />
      </WorkflowProvider>

      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={4000}
      />
    </div>
  );
}

export default App;
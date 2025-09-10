// src/App.tsx
import React from 'react';
import { Toaster } from 'sonner';
import { WorkflowProvider } from '@/contexts/WorkflowProvider';
import IntelligentRouter from '@/components/IntelligentRouter';
import './App.css';

function App() {
  const handleSystemReady = (status: any) => {
    console.log('🎯 [App] Système prêt avec status:', status);
  };

  const handleSystemError = (error: Error) => {
    console.error('❌ [App] Erreur système:', error);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WorkflowProvider>
        <IntelligentRouter
          onSystemReady={handleSystemReady}
          onError={handleSystemError}
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
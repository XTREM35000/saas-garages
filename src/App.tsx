// src/App.tsx
import React from 'react';
import { Toaster } from 'sonner';
import { WorkflowManager } from '@/components/WorkflowManager';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <WorkflowManager />
      
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
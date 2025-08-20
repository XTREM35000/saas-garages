import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { WorkflowProvider } from "@/contexts/WorkflowProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { SplashScreenManager } from "@/components/SplashScreenManager";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// logique workflow
import { useWorkflowCheck } from "@/hooks/useWorkflowCheck";
import InitializationWizard from "@/components/InitializationWizard";

import { WorkflowStep } from "@/types/workflow.types";

const queryClient = new QueryClient();
const EnvDebugger = () => {
  useEffect(() => {
    console.log('🔍 Toutes les variables d\'environnement:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'); // Partiel pour sécurité
    console.log('MODE:', import.meta.env.MODE);
    console.log('DEV:', import.meta.env.DEV);
    console.log('PROD:', import.meta.env.PROD);
  }, []);

  return null;
};
const AppContent = () => {
  const { isChecking, currentStep } = useWorkflowCheck();


  useEffect(() => {
    console.log("🚦 Workflow debug:", {
      currentStep,
      env: import.meta.env.MODE,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
      MODE: import.meta.env.MODE

    });
  }, [currentStep]);

  if (isChecking || currentStep === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-green-700">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">⏳ Chargement du workflow...</p>
        </div>
      </div>
    );
  }

  // Si pas encore arrivé au "dashboard" → lancer le wizard
  if (currentStep !== "dashboard") {
    return (
      <InitializationWizard
        isOpen={true}
        onComplete={() => console.log("🎉 Workflow terminé")}
        startStep={currentStep as WorkflowStep}
      />
    );
  }

  // Workflow complet → layout normal avec logo animé
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

const App = () => (
  <>
    <EnvDebugger />
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <WorkflowProvider>
            <TooltipProvider>
              <SplashScreenManager>
                <AppContent />
              </SplashScreenManager>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </WorkflowProvider>
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </>
);

export default App;

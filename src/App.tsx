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
import TestWhatsApp from "./pages/TestWhatsApp";
import { useWorkflowCheck } from "@/hooks/useWorkflowCheck";
import NewInitializationWizard from "@/components/NewInitializationWizard";
import { WorkflowStep } from "@/types/workflow.types";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isChecking, currentStep } = useWorkflowCheck();

  // Debug des variables d'environnement
  useEffect(() => {
    console.log("🔍 Variables d'environnement:", {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?
        import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'non défini',
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });
  }, []);

  // Debug du workflow
  useEffect(() => {
    console.log("🚦 Workflow debug:", { currentStep, env: import.meta.env.MODE });
  }, [currentStep]);

  if (isChecking || currentStep === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E] to-[#25D366]">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">⏳ Chargement du workflow...</p>
        </div>
      </div>
    );
  }

  if (currentStep !== "dashboard") {
    return (
      <NewInitializationWizard
        isOpen={true}
        onComplete={() => console.log("🎉 Workflow terminé")}
      />
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/test-whatsapp" element={<TestWhatsApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

const App = () => (
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
);

export default App;

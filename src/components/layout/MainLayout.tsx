import React, { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/ui/toast-system';
import { 
  SuperAdminModal, 
  AdminModal, 
  OrganizationModal, 
  SMSValidationModal, 
  GarageModal 
} from '@/components/modals/WorkflowModals';
import { useApp } from '@/contexts/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentStep, setCurrentStep, setCurrentUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Simuler la vérification du workflow au démarrage
  useEffect(() => {
    const checkWorkflowStatus = async () => {
      // Simulation: vérifier l'état en base
      const hassSuperAdmin = false; // À remplacer par vraie vérification Supabase
      const hasAdmin = false;
      const hasOrganization = false;
      const isSMSValidated = false;
      const hasGarage = false;

      if (!hassSuperAdmin) {
        setCurrentStep('super-admin');
      } else if (!hasAdmin) {
        setCurrentStep('admin');
      } else if (!hasOrganization) {
        setCurrentStep('organization');
      } else if (!isSMSValidated) {
        setCurrentStep('sms-validation');
      } else if (!hasGarage) {
        setCurrentStep('garage');
      } else {
        setCurrentStep('dashboard');
        // Simuler un utilisateur connecté
        setCurrentUser({
          name: 'Admin Garage',
          email: 'admin@garage.com',
          role: 'Super Admin',
          avatar: null,
        });
      }

      setShowModal(true);
    };

    // Délai pour effet visuel
    setTimeout(() => {
      checkWorkflowStatus();
    }, 1000);
  }, [setCurrentStep, setCurrentUser]);

  const handleStepComplete = () => {
    const steps = ['super-admin', 'admin', 'organization', 'sms-validation', 'garage', 'dashboard'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      setCurrentStep('dashboard');
      setCurrentUser({
        name: 'Admin Garage',
        email: 'admin@garage.com',
        role: 'Super Admin',
        avatar: null,
      });
      setShowModal(false);
    }
  };

  // Affichage du loader initial
  if (currentStep === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Initialisation de GaragePro</h2>
          <p className="text-muted-foreground">Vérification de la configuration...</p>
        </div>
      </div>
    );
  }

  // Si on est au dashboard, afficher l'interface normale
  if (currentStep === 'dashboard' && !showModal) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <ToastContainer />
      </div>
    );
  }

  // Afficher les modals du workflow
  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Bienvenue dans GaragePro
          </h1>
          <p className="text-muted-foreground">
            Configuration initiale de votre plateforme multi-tenant
          </p>
        </div>
      </div>

      {/* Modals du workflow */}
      <SuperAdminModal
        isOpen={currentStep === 'super-admin'}
        onClose={() => {}}
        onComplete={handleStepComplete}
      />
      
      <AdminModal
        isOpen={currentStep === 'admin'}
        onClose={() => {}}
        onComplete={handleStepComplete}
      />
      
      <OrganizationModal
        isOpen={currentStep === 'organization'}
        onClose={() => {}}
        onComplete={handleStepComplete}
      />
      
      <SMSValidationModal
        isOpen={currentStep === 'sms-validation'}
        onClose={() => {}}
        onComplete={handleStepComplete}
      />
      
      <GarageModal
        isOpen={currentStep === 'garage'}
        onClose={() => {}}
        onComplete={handleStepComplete}
      />

      <ToastContainer />
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import { Button } from '@/components/ui/button';
import OrganisationOnboarding from '@/components/OrganisationOnboarding';
import BrandSetupWizard from '@/components/BrandSetupWizard';

interface SimpleSetupProps {
  onComplete: () => void;
  children: React.ReactNode;
}

export type SetupStep = 'splash' | 'pricing' | 'organisation' | 'brand' | 'complete' | 'redirect-auth';

const SimpleSetup: React.FC<SimpleSetupProps> = ({ onComplete, children }) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('splash');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [organisationId, setOrganisationId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Démarrer directement avec splash puis pricing
    console.log('🚀 Démarrage du workflow de setup simplifié');
  }, []);

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    setCurrentStep('organisation');
  };

  const handleOrganisationCreated = (orgId: string) => {
    setOrganisationId(orgId);
    setCurrentStep('brand');
  };

  const handleBrandSetupComplete = () => {
    setCurrentStep('complete');
    onComplete();
  };

  // Render selon l'étape actuelle
  switch (currentStep) {
    case 'splash':
      return <SplashScreen onComplete={() => setCurrentStep('pricing')} />;

    case 'pricing':
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sélection du Plan</h2>
            <p className="text-gray-600 mb-6">Choisissez votre plan tarifaire</p>
            <Button onClick={() => handlePlanSelection('starter')}>
              Plan Starter
            </Button>
          </div>
        </div>
      );

    case 'organisation':
      return (
        <OrganisationOnboarding
          onComplete={handleOrganisationCreated}
          plan={selectedPlan}
        />
      );

    case 'brand':
      return (
        <BrandSetupWizard
          isOpen={true}
          onComplete={handleBrandSetupComplete}
        />
      );

    case 'complete':
    default:
      return <>{children}</>;
  }
};

export default SimpleSetup;
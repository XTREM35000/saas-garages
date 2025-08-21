import React, { useState, useEffect } from 'react';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { useAuthWorkflow } from '@/hooks/useAuthWorkflow';
import { WorkflowStep } from '@/types/workflow.types';
import { WorkflowProgressBar } from '@/components/WorkflowProgressBar';
import { SuperAdminCreationModal } from '@/components/SuperAdminCreationModal';
import PricingModal from '@/components/PricingModal';
import OrganizationSetupModal from '@/components/OrganizationSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import AdminCreationModal from '@/components/AdminCreationModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NewInitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

const NewInitializationWizard: React.FC<NewInitializationWizardProps> = ({
  isOpen,
  onComplete
}) => {
  const { state, completeStep, isLoading, error } = useWorkflow();
  const { session } = useAuthWorkflow();
  const [isCheckingSuperAdmin, setIsCheckingSuperAdmin] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);

  console.log('🎭 [NewInitializationWizard] État actuel:', state);

  // Vérifier si un Super Admin existe déjà
  useEffect(() => {
    const checkSuperAdminExists = async () => {
      if (state.currentStep === 'super_admin_check' && !isCheckingSuperAdmin) {
        setIsCheckingSuperAdmin(true);

        try {
          // Vérifier si un Super Admin existe déjà
          const { data: superAdminExists, error: checkError } = await supabase.rpc('is_super_admin');

          if (checkError) {
            console.error('❌ Erreur vérification Super Admin:', checkError);
            toast.error('Erreur lors de la vérification Super Admin');
            return;
          }

          if (superAdminExists) {
            // Un Super Admin existe déjà, passer à l'étape suivante
            console.log('✅ Super Admin existe déjà, passage à l\'étape suivante');
            await completeStep('super_admin_check');
          } else {
            // Aucun Super Admin, afficher le modal de création
            console.log('ℹ️ Aucun Super Admin trouvé, affichage du modal de création');
            setShowSuperAdminModal(true);
          }
        } catch (err) {
          console.error('❌ Erreur lors de la vérification Super Admin:', err);
          toast.error('Erreur lors de la vérification Super Admin');
        } finally {
          setIsCheckingSuperAdmin(false);
        }
      }
    };

    checkSuperAdminExists();
  }, [state.currentStep, isCheckingSuperAdmin, completeStep]);

  // Gestionnaire de progression
  const handleStepComplete = async (stepData?: any) => {
    try {
      console.log('🎯 [NewInitializationWizard] Complétion étape:', state.currentStep, stepData);

      if (state.currentStep === 'garage_setup') {
        // Dernière étape, terminer le workflow
        await completeStep(state.currentStep);
        onComplete();
        return;
      }

      await completeStep(state.currentStep);
      toast.success(`Étape ${state.currentStep} complétée !`);
    } catch (err) {
      console.error('❌ [NewInitializationWizard] Erreur progression:', err);
      toast.error('Erreur lors de la progression');
    }
  };

  // Gestionnaire de création du Super Admin
  const handleSuperAdminCreated = async (userData: any) => {
    try {
      console.log('✅ Super Admin créé:', userData);
      setShowSuperAdminModal(false);

      // Compléter l'étape super_admin_check
      await completeStep('super_admin_check');

      toast.success('Super Administrateur créé avec succès ! 🎉');
    } catch (err) {
      console.error('❌ Erreur lors de la création du Super Admin:', err);
      toast.error('Erreur lors de la création du Super Admin');
    }
  };

  // Rendu de l'étape courante
  const renderCurrentStep = () => {
    if (isLoading || isCheckingSuperAdmin) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#128C7E]/20 border-t-[#128C7E] rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-[#128C7E] mb-2">
              {isCheckingSuperAdmin ? 'Vérification Super Admin...' : 'Chargement du workflow...'}
            </h3>
            <p className="text-gray-600">
              {isCheckingSuperAdmin ? 'Vérification en cours...' : 'Préparation de votre espace de gestion'}
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-red-500 text-2xl">⚠️</div>
            </div>
            <h3 className="text-xl font-semibold text-red-700 mb-4">Erreur Workflow</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#128C7E] text-white px-6 py-3 rounded-xl hover:bg-[#075E54] transition-colors duration-200 font-medium"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    switch (state.currentStep) {
      case 'super_admin_check':
        // Afficher un message d'attente pendant la vérification
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#128C7E]/20 border-t-[#128C7E] rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-[#128C7E] mb-2">Vérification Super Admin...</h3>
              <p className="text-gray-600">Configuration automatique en cours</p>
            </div>
          </div>
        );

      case 'admin_creation':
        return (
          <AdminCreationModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            adminData={{
              email: '',
              password: '',
              phone: '',
              name: '',
            }}
            onAdminDataChange={() => { }}
            showPassword={false}
            onToggleShowPassword={() => { }}
            isLoading={false}
          />
        );

      case 'pricing_selection':
        return (
          <PricingModal
            isOpen={isOpen}
            onSelectPlan={handleStepComplete}
          />
        );

      case 'org_creation':
        return (
          <OrganizationSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            selectedPlan=""
          />
        );

      case 'sms_validation':
        return (
          <SmsValidationModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            organizationName=""
            organizationCode=""
            adminName=""
          />
        );

      case 'garage_setup':
        return (
          <GarageSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            organizationName=""
          />
        );

      default:
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-3xl">🎉</div>
              </div>
              <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Workflow terminé !</h3>
              <p className="text-gray-600 mb-6">
                Félicitations ! Votre système est maintenant entièrement configuré et prêt à l'emploi.
              </p>
              <button
                onClick={onComplete}
                className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white px-8 py-4 rounded-xl hover:from-[#075E54] hover:to-[#128C7E] transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Accéder au Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* Barre de progression avec thème WhatsApp */}
      <WorkflowProgressBar
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
      />

      {/* Contenu principal - SANS padding */}
      <div>
        {renderCurrentStep()}
      </div>

      {/* Modal de création du Super Admin */}
      <SuperAdminCreationModal
        isOpen={showSuperAdminModal}
        onComplete={handleSuperAdminCreated}
        onClose={() => setShowSuperAdminModal(false)}
      />
    </>
  );
};

export default NewInitializationWizard;

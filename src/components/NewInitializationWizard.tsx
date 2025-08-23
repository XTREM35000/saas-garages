import React, { useState, useEffect, useCallback } from 'react';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { useAuthWorkflow } from '@/hooks/useAuthWorkflow';
import { WorkflowStep } from '@/types/workflow.types';
import WorkflowProgressBar from '@/components/WorkflowProgressBar';
import { SuperAdminCreationModal } from '@/components/SuperAdminCreationModal';

import ThankYouMessage from '@/components/ThankYouMessage';
import { OrganizationSetupModal } from '@/components/OrganizationSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import { AdminCreationModal } from '@/components/AdminCreationModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import '../styles/whatsapp-theme.css';

interface NewInitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const NewInitializationWizard: React.FC<NewInitializationWizardProps> = ({
  isOpen,
  onComplete
}) => {
  const { state, completeStep, isLoading, error } = useWorkflow();
  const { session } = useAuthWorkflow();
  const [isCheckingSystem, setIsCheckingSystem] = useState(false);

  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [superAdminInfo, setSuperAdminInfo] = useState<{ name: string; phone: string } | null>(null);
  const [systemState, setSystemState] = useState<{
    hasSuperAdmin: boolean;
    hasAdmin: boolean;
    hasOrg: boolean;
    hasGarage: boolean;
    hasResponsable: boolean;
  }>({
    hasSuperAdmin: false,
    hasAdmin: false,
    hasOrg: false,
    hasGarage: false,
    hasResponsable: false
  });

  console.log('🎭 [NewInitializationWizard] État actuel:', state);

  // Vérifier l'état complet du système au chargement
  useEffect(() => {
    const checkCompleteSystemState = async () => {
      if (state.currentStep === 'super_admin_check' && !isCheckingSystem) {
        setIsCheckingSystem(true);
        console.log('🔍 Vérification complète de l\'état du système...');

        try {
          // 1. Vérifier Super Admin
          const { data: superAdmins, error: superAdminError } = await supabase
            .from('super_admins')
            .select('*')
            .eq('est_actif', true)
            .limit(1);

          if (superAdminError) {
            console.error('❌ Erreur vérification Super Admin:', superAdminError);
            toast.error('Erreur lors de la vérification Super Admin');
            return;
          }

          const hasSuperAdmin = superAdmins && superAdmins.length > 0;

          if (hasSuperAdmin) {
            const superAdmin = superAdmins[0];
            setSuperAdminInfo({
              name: superAdmin.nom + ' ' + superAdmin.prenom,
              phone: superAdmin.phone
            });
          }

          // 2. Vérifier Admin
          let hasAdmin = false;
          if (hasSuperAdmin) {
            const { data: admins, error: adminError } = await supabase
              .from('admins')
              .select('*')
              .eq('est_actif', true)
              .limit(1);

            if (adminError) {
              console.error('❌ Erreur vérification Admin:', adminError);
              toast.error('Erreur lors de la vérification Admin');
              return;
            }

            hasAdmin = admins && admins.length > 0;
          }

          // 3. Vérifier Organisation
          let hasOrg = false;
          if (hasAdmin) {
            const { data: organizations, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .limit(1);

            if (orgError) {
              console.error('❌ Erreur vérification Organisation:', orgError);
              toast.error('Erreur lors de la vérification Organisation');
              return;
            }

            hasOrg = organizations && organizations.length > 0;
          }

          // 4. Vérifier Garage et Responsable
          let hasGarage = false;
          let hasResponsable = false;
          if (hasOrg) {
            const { data: garages, error: garageError } = await supabase
              .from('garages')
              .select('*, responsables(*)')
              .limit(1);

            if (garageError) {
              console.error('❌ Erreur vérification Garage:', garageError);
              toast.error('Erreur lors de la vérification Garage');
              return;
            }

            hasGarage = garages && garages.length > 0;
            hasResponsable = hasGarage && garages[0].responsables && garages[0].responsables.length > 0;
          }

          // Mettre à jour l'état du système
          const newSystemState = {
            hasSuperAdmin,
            hasAdmin,
            hasOrg,
            hasGarage,
            hasResponsable
          };
          setSystemState(newSystemState);

          // Déterminer la prochaine étape selon l'état du système
          let nextStep: WorkflowStep = 'super_admin_check';
          let completedSteps: WorkflowStep[] = [];

          if (hasSuperAdmin) {
            completedSteps.push('super_admin_check');

            if (hasAdmin) {
              completedSteps.push('admin_creation');

              if (hasOrg) {
                completedSteps.push('org_creation');

                if (hasGarage && hasResponsable) {
                  completedSteps.push('garage_setup');
                  nextStep = 'sms_validation';
                } else {
                  nextStep = 'garage_setup';
                }
              } else {
                nextStep = 'org_creation';
              }
            } else {
              nextStep = 'admin_creation';
            }
          }

          // Mettre à jour l'état du workflow
          state.currentStep = nextStep;
          state.completedSteps = completedSteps;

          // Sauvegarder dans localStorage
          try {
            localStorage.setItem('workflow_state', JSON.stringify({
              currentStep: nextStep,
              completedSteps: completedSteps,
              lastUpdated: new Date().toISOString(),
              systemState: newSystemState,
              superAdminInfo: hasSuperAdmin ? {
                name: superAdmins[0].nom + ' ' + superAdmins[0].prenom,
                phone: superAdmins[0].phone
              } : null
            }));
            console.log('✅ État du workflow sauvegardé dans localStorage');
          } catch (err) {
            console.warn('⚠️ Impossible de sauvegarder dans localStorage:', err);
          }

          // Afficher le bon modal selon l'état
          if (!hasSuperAdmin) {
            // NOUVEAU WORKFLOW : Commencer par le Pricing Plan
            // Pricing modal removed - using existing workflow
          } else if (!hasAdmin) {
            setShowAdminModal(true);
          } else if (!hasOrg) {
            setShowOrgModal(true);
          } else if (!hasGarage || !hasResponsable) {
            setShowGarageModal(true);
          } else {
            setShowSmsModal(true);
          }

          // Forcer le re-render
          setForceUpdate(prev => prev + 1);
          console.log(`🔄 Progression automatique vers ${nextStep}`);

        } catch (err) {
          console.error('❌ Erreur lors de la vérification du système:', err);
          toast.error('Erreur lors de la vérification du système');
        } finally {
          setTimeout(() => {
            setIsCheckingSystem(false);
          }, 500);
        }
      }
    };

    checkCompleteSystemState();
  }, [state.currentStep, isCheckingSystem]);

  // Gestionnaire de sélection du plan
  const handlePlanSelected = async (planData: any) => {
    try {
      console.log('✅ Plan sélectionné:', planData);
              // Pricing modal removed

      // Sauvegarder le plan sélectionné
      setSelectedPlan(planData.plan);

      // Afficher le message de remerciement
      setShowThankYou(true);

      toast.success(`Plan ${planData.plan} sélectionné ! 🎉`);
    } catch (err) {
      console.error('❌ Erreur lors de la sélection du plan:', err);
      toast.error('Erreur lors de la sélection du plan');
    }
  };

  // Continuer vers la création du Super Admin après le message de remerciement
  const handleContinueToSuperAdmin = () => {
    setShowThankYou(false);
    setShowSuperAdminModal(true);
  };

  // Gestionnaire de création du Super Admin
  const handleSuperAdminCreated = async (userData: any) => {
    try {
      console.log('✅ Super Admin créé:', userData);
      setShowSuperAdminModal(false);

      // Mettre à jour l'état du système
      setSystemState(prev => ({ ...prev, hasSuperAdmin: true }));

      // Passer à l'étape suivante
      state.currentStep = 'admin_creation';
      state.completedSteps = ['super_admin_check'];

      // Afficher le modal de création d'Admin
      setShowAdminModal(true);

      toast.success('Super Administrateur créé avec succès ! 🎉');
    } catch (err) {
      console.error('❌ Erreur lors de la création du Super Admin:', err);
      toast.error('Erreur lors de la création du Super Admin');
    }
  };

  // Gestionnaire de création de l'Admin
  const handleAdminCreated = async (adminData: any) => {
    try {
      console.log('✅ Admin créé:', adminData);
      setShowAdminModal(false);

      // Mettre à jour l'état du système
      setSystemState(prev => ({ ...prev, hasAdmin: true }));

      // Passer à l'étape suivante
      state.currentStep = 'org_creation';
      state.completedSteps = ['super_admin_check', 'admin_creation'];

      // Afficher le modal de création d'Organisation
      setShowOrgModal(true);

      toast.success('Administrateur créé avec succès ! 🎉');
    } catch (err) {
      console.error('❌ Erreur lors de la création de l\'Admin:', err);
      toast.error('Erreur lors de la création de l\'Administrateur');
    }
  };

  // Gestionnaire de création de l'Organisation
  const handleOrgCreated = async (orgData: any) => {
    try {
      console.log('✅ Organisation créée:', orgData);
      setShowOrgModal(false);

      // Mettre à jour l'état du système
      setSystemState(prev => ({ ...prev, hasOrg: true }));

      // Passer à l'étape suivante
      state.currentStep = 'garage_setup';
      state.completedSteps = ['super_admin_check', 'admin_creation', 'org_creation'];

      // Afficher le modal de création de Garage
      setShowGarageModal(true);

      toast.success('Organisation créée avec succès ! 🎉');
    } catch (err) {
      console.error('❌ Erreur lors de la création de l\'Organisation:', err);
      toast.error('Erreur lors de la création de l\'Organisation');
    }
  };

  // Gestionnaire de création du Garage
  const handleGarageCreated = async (garageData: any) => {
    try {
      console.log('✅ Garage créé:', garageData);
      setShowGarageModal(false);

      // Mettre à jour l'état du système
      setSystemState(prev => ({ ...prev, hasGarage: true, hasResponsable: true }));

      // Passer à l'étape suivante
      state.currentStep = 'sms_validation';
      state.completedSteps = ['super_admin_check', 'admin_creation', 'org_creation', 'garage_setup'];

      // Afficher le modal de validation SMS
      setShowSmsModal(true);

      toast.success('Garage créé avec succès ! 🎉');
    } catch (err) {
      console.error('❌ Erreur lors de la création du Garage:', err);
      toast.error('Erreur lors de la création du Garage');
    }
  };

  // Gestionnaire de validation SMS
  const handleSmsValidated = async (smsData: any) => {
    try {
      console.log('✅ SMS validé:', smsData);
      setShowSmsModal(false);

      // Workflow terminé, rediriger vers le dashboard
      onComplete();

      toast.success('Validation SMS réussie ! 🎉');
    } catch (err) {
      console.error('❌ Erreur lors de la validation SMS:', err);
      toast.error('Erreur lors de la validation SMS');
    }
  };

  // Rendu de l'étape courante
  const renderCurrentStep = () => {
    if (isLoading || isCheckingSystem) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#128C7E]/20 border-t-[#128C7E] rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-[#128C7E] mb-2">
              {isCheckingSystem ? 'Vérification du système...' : 'Chargement du workflow...'}
            </h3>
            <p className="text-gray-600">
              {isCheckingSystem ? 'Analyse de l\'état actuel...' : 'Préparation de votre espace de gestion'}
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

    // Afficher le contenu selon l'étape actuelle
    switch (state.currentStep) {
      case 'super_admin_check':
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#128C7E]/20 border-t-[#128C7E] rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-[#128C7E] mb-2">Vérification du système...</h3>
              <p className="text-gray-600">Configuration automatique en cours</p>
            </div>
          </div>
        );

      case 'pricing_selection':
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-3xl">💰</div>
              </div>
              <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Sélection du Plan d'Abonnement</h3>
              <p className="text-gray-600 mb-6">
                Choisissez le plan qui correspond le mieux à vos besoins.
              </p>
            </div>
          </div>
        );

      case 'admin_creation':
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-3xl">👤</div>
              </div>
              <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Création de l'Administrateur</h3>
              <p className="text-gray-600 mb-6">
                Créez un administrateur pour gérer votre organisation.
              </p>
            </div>
          </div>
        );

      case 'org_creation':
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-3xl">🏢</div>
              </div>
              <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Création de l'Organisation</h3>
              <p className="text-gray-600 mb-6">
                Configurez votre organisation et ses informations.
              </p>
            </div>
          </div>
        );

      case 'garage_setup':
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-3xl">🚗</div>
              </div>
              <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Configuration du Garage</h3>
              <p className="text-gray-600 mb-6">
                Créez votre premier garage et assignez un responsable.
              </p>
            </div>
          </div>
        );

      case 'sms_validation':
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-3xl">📱</div>
              </div>
              <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Validation SMS</h3>
              <p className="text-gray-600 mb-6">
                Validez votre numéro de téléphone pour finaliser la configuration.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-3xl">🎉</div>
              </div>
              <h3 className="text-2xl font-bold text-[#128C7E] mb-4">Configuration terminée !</h3>
              <p className="text-gray-600 mb-6">
                Votre système est maintenant entièrement configuré.
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

  // Ne rendre que si le modal est ouvert
  if (!isOpen) {
    return null;
  }

  return (
    <WhatsAppModal isOpen={isOpen} onClose={() => {}} size="xl">
      <div className="max-w-4xl mx-auto">
        {/* Barre de progression avec thème WhatsApp */}
        <WorkflowProgressBar
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
        />

        {/* Contenu principal */}
        <div>
          {renderCurrentStep()}
        </div>
      </div>
    </WhatsAppModal>

    {/* Modals conditionnels */}
    {showSuperAdminModal && (
      <SuperAdminCreationModal
        isOpen={showSuperAdminModal}
        onComplete={handleSuperAdminCreated}
        onClose={() => setShowSuperAdminModal(false)}
      />
    )}

    {showAdminModal && (
      <AdminCreationModal
        isOpen={showAdminModal}
        onComplete={handleAdminCreated}
        onClose={() => setShowAdminModal(false)}
      />
    )}

    {showOrgModal && (
      <OrganizationSetupModal
        isOpen={showOrgModal}
        onComplete={handleOrgCreated}
        selectedPlan={selectedPlan || 'monthly'}
      />
    )}

    {showGarageModal && (
      <GarageSetupModal
        isOpen={showGarageModal}
        onComplete={handleGarageCreated}
        organizationName=""
      />
    )}

    {showSmsModal && (
      <SmsValidationModal
        isOpen={showSmsModal}
        onComplete={handleSmsValidated}
        organizationName=""
        organizationCode=""
        adminCode=""
        adminName=""
      />
    )}

    {/* Message de remerciement après sélection du plan */}
    {showThankYou && (
      <ThankYouMessage
        isOpen={showThankYou}
        selectedPlan={selectedPlan}
        superAdminInfo={superAdminInfo}
        onContinue={handleContinueToSuperAdmin}
      />
    )}
  </>
  );
};

export default NewInitializationWizard;



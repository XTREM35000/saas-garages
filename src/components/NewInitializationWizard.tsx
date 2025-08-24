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

  // Fonction pour gérer le clic sur une étape
  const handleStepClick = (step: WorkflowStep) => {
    console.log('Clic sur l\'étape:', step);
    
    // Ouvrir le modal correspondant à l'étape cliquée
    switch (step) {
      case 'super_admin_check':
        setShowSuperAdminModal(true);
        break;
      case 'admin_creation':
        setShowAdminModal(true);
        break;
      case 'org_creation':
        setShowOrgModal(true);
        break;
      case 'sms_validation':
        setShowSmsModal(true);
        break;
      case 'garage_setup':
        setShowGarageModal(true);
        break;
      default:
        console.log('Étape non gérée:', step);
    }
  };

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

          // 2. Vérifier Admin (seulement si Super Admin existe)
          let hasAdmin = false;
          if (hasSuperAdmin) {
            try {
              const { data: admins, error: adminError } = await supabase
                .from('admins')
                .select('*')
                .limit(1);

              if (adminError) {
                console.error('❌ Erreur vérification Admin:', adminError);
                // Ne pas afficher d'erreur toast, juste continuer
              } else {
                hasAdmin = admins && admins.length > 0;
              }
            } catch (error) {
              console.error('❌ Erreur lors de la vérification Admin:', error);
              // Continuer sans bloquer
            }
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

            // Après Super Admin, on passe à la sélection du plan
            nextStep = 'pricing_selection';

            // Note: On ne vérifie pas encore l'Admin car on doit d'abord sélectionner le plan
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
            // NOUVEAU WORKFLOW : Afficher le modal de création Super Admin
            console.log('🚀 Aucun Super Admin trouvé, affichage du modal de création');
            setShowSuperAdminModal(true);
          } else {
            // Super Admin existe, commencer par la sélection du plan
            console.log('💰 Super Admin existe, début du workflow par la sélection du plan');
            state.currentStep = 'pricing_selection';
            state.completedSteps = ['super_admin_check'];
            // Le modal de pricing sera affiché automatiquement par renderCurrentStep
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

  // Gestionnaire de création du Super Admin
  const handleSuperAdminCreated = async (userData: any) => {
    try {
      console.log('✅ Super Admin créé:', userData);
      setShowSuperAdminModal(false);

      // Mettre à jour l'état du système
      setSystemState(prev => ({ ...prev, hasSuperAdmin: true }));

      // Passer à l'étape suivante : PRICING SELECTION
      state.currentStep = 'pricing_selection';
      state.completedSteps = ['super_admin_check'];

      // Afficher le modal de sélection du plan
      // Note: Le modal de pricing sera affiché automatiquement par renderCurrentStep
      toast.success('Super Administrateur créé avec succès ! 🎉');
    } catch (err) {
      console.error('❌ Erreur lors de la création du Super Admin:', err);
      toast.error('Erreur lors de la création du Super Admin');
    }
  };

  // Gestionnaire de sélection du plan
  const handlePlanSelected = async (planData: any) => {
    try {
      console.log('✅ Plan sélectionné:', planData);

      // Sauvegarder le plan sélectionné
      setSelectedPlan(planData.plan);

      // Mettre à jour l'état du workflow
      state.currentStep = 'admin_creation';
      state.completedSteps = ['super_admin_check', 'pricing_selection'];

      // Afficher le modal de création d'Admin
      setShowAdminModal(true);

      toast.success(`Plan ${planData.plan} sélectionné ! 🎉`);
    } catch (err) {
      console.error('❌ Erreur lors de la sélection du plan:', err);
      toast.error('Erreur lors de la sélection du plan');
    }
  };

  // Continuer vers la création de l'Admin après le message de remerciement
  const handleContinueToAdmin = () => {
    setShowThankYou(false);
    setShowAdminModal(true);
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
            <div className="text-center max-w-6xl mx-auto p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-3xl">💰</div>
              </div>
              <h3 className="text-3xl font-bold text-[#128C7E] mb-4">Sélection du Plan d'Abonnement</h3>
              <p className="text-xl text-gray-600 mb-8">
                Choisissez le plan qui correspond le mieux à vos besoins et commencez votre aventure avec MGC
              </p>
              
              {/* Plans disponibles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Plan Gratuit */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-[#128C7E] transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-white text-2xl">⭐</div>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h4>
                    <div className="text-4xl font-bold text-green-600 mb-2">€0</div>
                    <p className="text-gray-600">Par mois</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">1 garage seulement</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Gestion de base</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Jusqu'à 3 utilisateurs</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Support communautaire</span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelected({ plan: 'free' })}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Choisir le Plan Gratuit
                  </button>
                </div>

                {/* Plan Mensuel - RECOMMANDÉ */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-[#128C7E] relative transform scale-105">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white px-4 py-2 rounded-full text-sm font-bold">
                      RECOMMANDÉ
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-white text-2xl">⚡</div>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Mensuel</h4>
                    <div className="text-4xl font-bold text-[#128C7E] mb-2">€29</div>
                    <p className="text-gray-600">Par mois</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-[#128C7E]/20 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#128C7E] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">1 organisation</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-[#128C7E]/20 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#128C7E] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">3 instances maximum</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-[#128C7E]/20 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#128C7E] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Utilisateurs illimités</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-[#128C7E]/20 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#128C7E] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Support par email</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-[#128C7E]/20 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#128C7E] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Analytics avancés</span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelected({ plan: 'monthly' })}
                    className="w-full bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white py-3 px-6 rounded-xl hover:from-[#075E54] hover:to-[#128C7E] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Choisir le Plan Mensuel
                  </button>
                </div>

                {/* Plan Annuel */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-white text-2xl">👑</div>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Annuel</h4>
                    <div className="text-4xl font-bold text-purple-600 mb-2">€299</div>
                    <p className="text-gray-600">Par an</p>
                    <div className="text-sm text-green-600 font-medium">Économisez 2 mois !</div>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Organisations multiples</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Instances illimitées</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Support VIP 24/7</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">API personnalisée</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Formation dédiée</span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelected({ plan: 'annual' })}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 px-6 rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Choisir le Plan Annuel
                  </button>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">💡 Pourquoi choisir MGC ?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="text-blue-600 text-xl">🚀</div>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Déploiement Rapide</h5>
                    <p className="text-sm text-gray-600">Configuration en moins de 5 minutes</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="text-green-600 text-xl">🔒</div>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Sécurité Maximale</h5>
                    <p className="text-sm text-gray-600">Données chiffrées et sauvegardées</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="text-purple-600 text-xl">📱</div>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Multi-Plateforme</h5>
                    <p className="text-sm text-gray-600">Accessible partout, tout le temps</p>
                  </div>
                </div>
              </div>
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
    <>
      <WhatsAppModal isOpen={isOpen} onClose={() => {}} size="xl">
        <div className="max-w-4xl mx-auto">
          {/* Barre de progression avec thème WhatsApp */}
          <WorkflowProgressBar
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            onStepClick={handleStepClick}
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
          adminName=""
        />
      )}

      {/* Message de remerciement après sélection du plan */}
      {showThankYou && (
        <ThankYouMessage
          isOpen={showThankYou}
          selectedPlan={selectedPlan}
          superAdminInfo={superAdminInfo}
          onContinue={handleContinueToAdmin}
        />
      )}
    </>
  );
};

export default NewInitializationWizard;



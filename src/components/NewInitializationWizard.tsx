import React, { useState, useEffect, useCallback } from 'react';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { useAuthWorkflow } from '@/hooks/useAuthWorkflow';
import { WorkflowStep } from '@/types/workflow.types';

// Type pour éviter l'inférence infinie
type WorkflowStepType = 'super_admin_check' | 'auth_general' | 'pricing_selection' | 'admin_creation' | 'org_creation' | 'garage_setup' | 'sms_validation' | 'completed';

import WorkflowProgressBar from '@/components/WorkflowProgressBar';
import { SuperAdminCreationModal } from '@/components/SuperAdminCreationModal';
import PricingModal from '@/components/PricingModal';

import ThankYouMessage from '@/components/ThankYouMessage';
import { OrganizationSetupModal } from '@/components/OrganizationSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import { AdminCreationModal } from '@/components/AdminCreationModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import '../styles/whatsapp-theme.css';
import GeneralAuthModal from '@/components/GeneralAuthModal';

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

  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Fonction de vérification initiale et logique du workflow
  const checkSystemAndProgress = useCallback(async () => {
    if (!isOpen) return;

    console.log('🔍 Vérification du système et progression automatique...');

    try {
      // 1. Vérifier Super Admin
      const { data: superAdmins } = await supabase
        .from('super_admins')
        .select('*')
        .eq('est_actif', true)
        .limit(1);

      const hasSuperAdmin = superAdmins && superAdmins.length > 0;

      if (!hasSuperAdmin) {
        console.log('❌ Aucun Super Admin trouvé - Affichage modal création');
        setShowSuperAdminModal(true);
        return;
      }

      // 2. Super Admin existe - Vérifier Admin
      const { data: admins } = await supabase
        .from('admins')
        .select('*')
        .limit(1);

      const hasAdmin = admins && admins.length > 0;

      if (!hasAdmin) {
        console.log('🔐 Super Admin existe - Passage à sélection pricing');
        setShowPricingModal(true);
        return;
      }

      // 3. Admin existe - Vérifier Organisation
      const { data: organizations } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);

      const hasOrg = organizations && organizations.length > 0;

      if (!hasOrg) {
        console.log('🏢 Admin existe - Passage à création organisation');
        setShowOrgModal(true);
        return;
      }

      // 4. Organisation existe - Vérifier Garage
      const { data: garages } = await supabase
        .from('garages')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      const hasGarage = garages && garages.length > 0;

      if (!hasGarage) {
        console.log('🏗️ Organisation existe - Passage à création garage');
        setShowGarageModal(true);
        return;
      }

      // 5. Tout est configuré - Workflow terminé
      console.log('✅ Workflow complet - Redirection dashboard');
      onComplete();

    } catch (error) {
      console.error('❌ Erreur vérification système:', error);
      toast.error('Erreur lors de la vérification du système');
    }
  }, [isOpen, onComplete]);

  // Vérification initiale
  useEffect(() => {
    checkSystemAndProgress();
  }, [checkSystemAndProgress]);

  // Gestionnaires d'événements
  const handleSuperAdminCreated = async () => {
    console.log('✅ Super Admin créé');
    setShowSuperAdminModal(false);
    setShowPricingModal(true);
    toast.success('Super Administrateur créé avec succès ! 🎉');
  };

  const handlePlanSelected = async (planData: any) => {
    console.log('✅ Plan sélectionné:', planData);
    setSelectedPlan(planData.plan);
    setShowPricingModal(false);
    setShowAdminModal(true);
    toast.success(`Plan ${planData.plan} sélectionné ! 🎉`);
  };

  const handleAdminCreated = async () => {
    console.log('✅ Admin créé');
    setShowAdminModal(false);
    setShowOrgModal(true);
    toast.success('Administrateur créé avec succès ! 🎉');
  };

  const handleOrgCreated = async () => {
    console.log('✅ Organisation créée');
    setShowOrgModal(false);
    setShowSmsModal(true);
    toast.success('Organisation créée avec succès ! 🎉');
  };

  const handleSmsValidated = async () => {
    console.log('✅ SMS validé');
    setShowSmsModal(false);
    setShowGarageModal(true);
    toast.success('Validation SMS réussie ! 🎉');
  };

  const handleGarageCreated = async () => {
    console.log('✅ Garage créé');
    setShowGarageModal(false);
    onComplete();
    toast.success('Garage créé avec succès ! 🎉');
  };

  // Affichage conditionnel des modals
  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Vérification du workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Super Admin */}
      {showSuperAdminModal && (
        <SuperAdminCreationModal
          isOpen={showSuperAdminModal}
          onComplete={handleSuperAdminCreated}
          onClose={() => setShowSuperAdminModal(false)}
        />
      )}

      {/* Modal Pricing */}
      {showPricingModal && (
        <PricingModal
          isOpen={showPricingModal}
          onSelectPlan={handlePlanSelected}
        />
      )}

      {/* Modal Admin */}
      {showAdminModal && (
        <AdminCreationModal
          isOpen={showAdminModal}
          onComplete={handleAdminCreated}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {/* Modal Organisation */}
      {showOrgModal && (
        <OrganizationSetupModal
          isOpen={showOrgModal}
          onComplete={handleOrgCreated}
        />
      )}

      {/* Modal SMS */}
      {showSmsModal && (
        <SmsValidationModal
          isOpen={showSmsModal}
          onComplete={handleSmsValidated}
          onClose={() => setShowSmsModal(false)}
          onSubmit={handleSmsValidated}
          organizationData={{
            name: "Organisation",
            slug: "ORG-001",
            adminName: "Admin"
          }}
        />
      )}

      {/* Modal Garage */}
      {showGarageModal && (
        <GarageSetupModal
          isOpen={showGarageModal}
          onComplete={handleGarageCreated}
          organizationName="Organisation"
        />
      )}
    </>
  );
};

export default NewInitializationWizard;
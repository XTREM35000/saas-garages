import { Shield, Users, CreditCard, UserCog, Building, MessageSquare, Home, LucideIcon } from 'lucide-react';
import type { WorkflowStepConfig } from '@/types/workflow.types';
import { SuperAdminCreationModal } from '@/components/SuperAdminCreationModal';
import PricingModal from '@/components/PricingModal';
import { AdminCreationModal } from '@/components/AdminCreationModal';
import { OrganizationSetupModal } from '@/components/OrganizationSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import GarageSetupModal from '@/components/GarageSetupModal';
type IconType = LucideIcon;

export const WORKFLOW_STEPS: Record<string, WorkflowStepConfig> = {
  SUPER_ADMIN: {
    id: 'super_admin',
    title: 'Super Admin',
    name: 'Super Admin',
    description: 'Configuration administrateur principal',
    component: SuperAdminCreationModal,
    icon: Shield,
    order: 1
  },
  PRICING: {
    id: 'pricing',
    title: 'Plan Tarifaire',
    name: 'Plan Tarifaire',
    description: 'Choix de l\'abonnement',
    component: PricingModal,
    icon: CreditCard,
    order: 2
  },
  ADMIN: {
    id: 'admin',
    title: 'Admin',
    name: 'Admin',
    description: 'Configuration administrateur',
    component: AdminCreationModal,
    icon: UserCog,
    order: 3
  },
  ORGANIZATION: {
    id: 'organization',
    title: 'Organisation',
    name: 'Organisation',
    description: 'Configuration de l\'entreprise',
    component: OrganizationSetupModal,
    icon: Building,
    order: 4
  },
  SMS: {
    id: 'sms_validation',
    title: 'Validation SMS',
    name: 'Validation SMS',
    description: 'Vérification du numéro',
    component: SmsValidationModal,
    icon: MessageSquare,
    order: 5
  },
  GARAGE: {
    id: 'garage',
    title: 'Configuration Garage',
    name: 'Configuration Garage',
    description: 'Paramétrage du garage',
    component: GarageSetupModal,
    icon: Home,
    order: 6
  }
};
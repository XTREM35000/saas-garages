import { Shield, Users, CreditCard, UserCog, Building, MessageSquare, Home, LucideIcon } from 'lucide-react';
import type { WorkflowStepConfig } from '@/types/workflow.types';
import SuperAdminLoginModal from '@/components/SuperAdminLoginModal';
import { GeneralAuthModal } from '@/components/GeneralAuthModal';
import { PricingModal } from '@/components/PricingModal';
import { AdminCreationModal } from '@/components/AdminCreationModal';
import { OrganizationModal } from '@/components/modals/OrganizationModal';
import { SmsValidationModal } from '@/components/SmsValidationModal';
import { GarageSetupModal } from '@/components/GarageSetupModal';
type IconType = LucideIcon;

export const WORKFLOW_STEPS: Record<string, WorkflowStepConfig> = {
  SUPER_ADMIN: {
    id: 'super_admin',
    title: 'Super Admin',
    name: 'Super Admin',
    description: 'Configuration administrateur principal',
    component: SuperAdminLoginModal,
    icon: Shield,
    order: 1
  },
  AUTH: {
    id: 'auth',
    title: 'Authentification',
    name: 'Authentification',
    description: 'Connexion utilisateur',
    component: GeneralAuthModal,
    icon: Users,
    order: 2
  },
  PRICING: {
    id: 'pricing',
    title: 'Plan Tarifaire',
    name: 'Plan Tarifaire',
    description: 'Choix de l\'abonnement',
    component: PricingModal,
    icon: CreditCard,
    order: 3
  },
  ADMIN: {
    id: 'admin',
    title: 'Admin',
    name: 'Admin',
    description: 'Configuration administrateur',
    component: AdminCreationModal,
    icon: UserCog,
    order: 4
  },
  ORGANIZATION: {
    id: 'organization',
    title: 'Organisation',
    name: 'Organisation',
    description: 'Configuration de l\'entreprise',
    component: OrganizationModal,
    icon: Building,
    order: 5
  },
  SMS: {
    id: 'sms',
    title: 'Validation SMS',
    name: 'Validation SMS',
    description: 'Vérification du numéro',
    component: SmsValidationModal,
    icon: MessageSquare,
    order: 6
  },
  GARAGE: {
    id: 'garage',
    title: 'Configuration Garage',
    name: 'Configuration Garage',
    description: 'Paramétrage du garage',
    component: GarageSetupModal,
    icon: Home,
    order: 7
  }
};
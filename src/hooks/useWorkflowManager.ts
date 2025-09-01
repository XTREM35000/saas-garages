// src/hooks/useWorkflowManager.ts
import { useEffect, useCallback } from 'react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useAuth } from '@/hooks/useAuth';
import {
  WorkflowStep,
  AdminCredentials,
  PlanDetails,
  OrganizationData,
  SmsValidationData,
  GarageSetupData,
  ValidationResult,
  WorkflowProgress
} from '@/types/workflow.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWorkflowManager() {
  const {
    currentStep,
    completedSteps,
    isCompleted,
    isLoading,
    error,
    adminCredentials,
    selectedPlan,
    organizationData,
    smsValidationData,
    garageSetupData,
    setCurrentStep,
    completeStep,
    resetWorkflow,
    setError,
    setLoading,
    loadWorkflowState,
    saveWorkflowState,
    validateStep,
    canProceedToStep,
  } = useWorkflowStore();

  const { user } = useAuth();

  // Charger l'état au montage
  useEffect(() => {
    if (user) {
      loadWorkflowState();
    }
  }, [user, loadWorkflowState]);

  // Calculer la progression
  const getProgress = useCallback((): WorkflowProgress => {
    const totalSteps = 7; // super_admin, admin, pricing, organization, sms_validation, garage, completed
    const completedCount = completedSteps.length;
    const percentage = Math.round((completedCount / totalSteps) * 100);

    return {
      currentStep,
      totalSteps,
      completedSteps: completedCount,
      percentage,
      canProceed: canProceedToStep(getNextStep(currentStep) || 'completed'),
      canGoBack: completedSteps.length > 0,
    };
  }, [currentStep, completedSteps, canProceedToStep]);

  // Validation des champs
  const validateField = useCallback((field: string, value: string): ValidationResult => {
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          error: emailRegex.test(value) ? undefined : 'Email invalide'
        };

      case 'password':
        return {
          isValid: value.length >= 8,
          error: value.length >= 8 ? undefined : 'Le mot de passe doit contenir au moins 8 caractères'
        };

      case 'phone':
        const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
        return {
          isValid: phoneRegex.test(value.replace(/\s/g, '')),
          error: phoneRegex.test(value.replace(/\s/g, '')) ? undefined : 'Numéro de téléphone invalide'
        };

      case 'organization_name':
        return {
          isValid: value.length >= 2,
          error: value.length >= 2 ? undefined : 'Le nom doit contenir au moins 2 caractères'
        };

      case 'garage_name':
        return {
          isValid: value.length >= 2,
          error: value.length >= 2 ? undefined : 'Le nom du garage doit contenir au moins 2 caractères'
        };

      default:
        return {
          isValid: value.length > 0,
          error: value.length > 0 ? undefined : 'Ce champ est requis'
        };
    }
  }, []);

  // Actions spécifiques aux étapes
  const handleSuperAdminComplete = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier si le super admin existe déjà
      const { data: existingSuperAdmin } = await supabase.rpc('check_super_admin_exists');

      if (!existingSuperAdmin) {
        // Créer le super admin
        const { error: createError } = await supabase.rpc('create_super_admin', {
          email: data.email,
          password: data.password,
          profile_data: data.profile
        });

        if (createError) throw createError;
      }

      await completeStep('super_admin', data);
      toast.success('Super Admin configuré avec succès !');

    } catch (error) {
      console.error('Erreur création super admin:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création du super admin');
      toast.error('Erreur lors de la création du super admin');
    } finally {
      setLoading(false);
    }
  }, [completeStep, setLoading, setError]);

  const handleAdminComplete = useCallback(async (credentials: AdminCredentials) => {
    try {
      setLoading(true);
      setError(null);

      // Créer l'admin
      const { error: createError } = await supabase.rpc('create_admin', {
        email: credentials.email,
        password: credentials.password
      });

      if (createError) throw createError;

      await completeStep('admin', credentials);
      toast.success('Admin créé avec succès !');

    } catch (error) {
      console.error('Erreur création admin:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création de l\'admin');
      toast.error('Erreur lors de la création de l\'admin');
    } finally {
      setLoading(false);
    }
  }, [completeStep, setLoading, setError]);

  const handlePricingComplete = useCallback(async (plan: PlanDetails) => {
    try {
      setLoading(true);
      setError(null);

      // Sauvegarder le plan sélectionné
      const { error: saveError } = await supabase
        .from('admin_plans')
        .upsert({
          admin_id: user?.id,
          plan_id: plan.id,
          selected_at: new Date().toISOString(),
          status: 'active'
        });

      if (saveError) throw saveError;

      await completeStep('pricing', plan);
      toast.success('Plan sélectionné avec succès !');

    } catch (error) {
      console.error('Erreur sélection plan:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la sélection du plan');
      toast.error('Erreur lors de la sélection du plan');
    } finally {
      setLoading(false);
    }
  }, [completeStep, setLoading, setError, user]);

  const handleOrganizationComplete = useCallback(async (data: OrganizationData) => {
    try {
      setLoading(true);
      setError(null);

      // Créer l'organisation
      const { data: org, error: createError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          country: data.country,
          admin_id: user?.id,
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      await completeStep('organization', { ...data, id: org.id });
      toast.success('Organisation créée avec succès !');

    } catch (error) {
      console.error('Erreur création organisation:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création de l\'organisation');
      toast.error('Erreur lors de la création de l\'organisation');
    } finally {
      setLoading(false);
    }
  }, [completeStep, setLoading, setError, user]);

  const handleSmsValidationComplete = useCallback(async (data: SmsValidationData) => {
    try {
      setLoading(true);
      setError(null);

      // Marquer la validation SMS comme utilisée
      const { error: updateError } = await supabase
        .from('sms_validations')
        .update({
          is_used: true,
          validated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      await completeStep('sms_validation', data);
      toast.success('SMS validé avec succès !');

    } catch (error) {
      console.error('Erreur validation SMS:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la validation SMS');
      toast.error('Erreur lors de la validation SMS');
    } finally {
      setLoading(false);
    }
  }, [completeStep, setLoading, setError]);

  const handleGarageComplete = useCallback(async (data: GarageSetupData) => {
    try {
      setLoading(true);
      setError(null);

      // Créer le garage
      const { data: garage, error: createError } = await supabase
        .from('garages')
        .insert({
          name: data.name,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          phone: data.phone,
          email: data.email,
          manager_name: data.manager_name,
          organization_id: organizationData?.id,
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      await completeStep('garage', { ...data, id: garage.id });
      toast.success('Garage configuré avec succès !');

    } catch (error) {
      console.error('Erreur création garage:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création du garage');
      toast.error('Erreur lors de la création du garage');
    } finally {
      setLoading(false);
    }
  }, [completeStep, setLoading, setError, organizationData]);

  // Navigation
  const goToStep = useCallback((step: WorkflowStep) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
    } else {
      toast.error('Impossible d\'accéder à cette étape');
    }
  }, [canProceedToStep, setCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    const stepOrder: WorkflowStep[] = [
      'super_admin',
      'admin',
      'pricing',
      'organization',
      'sms_validation',
      'garage',
      'completed'
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      setCurrentStep(previousStep);
    }
  }, [currentStep, setCurrentStep]);

  // Vérification de l'état global
  const checkWorkflowStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier l'état en base
      await loadWorkflowState();

      // Si le workflow est complet, rediriger vers le dashboard
      if (isCompleted) {
        // Redirection vers le dashboard admin
        window.location.href = '/dashboard';
      }

    } catch (error) {
      console.error('Erreur vérification workflow:', error);
      setError('Erreur lors de la vérification du workflow');
    } finally {
      setLoading(false);
    }
  }, [loadWorkflowState, isCompleted, setLoading, setError]);

  return {
    // État
    currentStep,
    completedSteps,
    isCompleted,
    isLoading,
    error,
    progress: getProgress(),

    // Données
    adminCredentials,
    selectedPlan,
    organizationData,
    smsValidationData,
    garageSetupData,

    // Actions
    handleSuperAdminComplete,
    handleAdminComplete,
    handlePricingComplete,
    handleOrganizationComplete,
    handleSmsValidationComplete,
    handleGarageComplete,

    // Navigation
    goToStep,
    goToPreviousStep,

    // Utilitaires
    validateField,
    validateStep,
    canProceedToStep,
    checkWorkflowStatus,
    resetWorkflow,
    setError,
  };
}

// Fonction helper pour obtenir la prochaine étape
function getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
  const stepOrder: WorkflowStep[] = [
    'super_admin',
    'admin',
    'pricing',
    'organization',
    'sms_validation',
    'garage',
    'completed'
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }

  return stepOrder[currentIndex + 1];
}
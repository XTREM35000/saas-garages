import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type WorkflowStep = 
  | 'loading'
  | 'super_admin' 
  | 'admin' 
  | 'organization' 
  | 'sms_validation' 
  | 'garage'
  | 'completed';

interface WorkflowState {
  current_step: WorkflowStep;
  has_super_admin: boolean;
  has_admin: boolean;
  has_organization: boolean;
  has_garage: boolean;
  is_completed: boolean;
}

export const useWorkflowManager = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'état du workflow
  const checkWorkflowState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await (supabase as any).rpc('check_workflow_state');
      
      if (rpcError) throw rpcError;

      const workflowState = data as WorkflowState;
      setCurrentStep(workflowState.current_step);
      
      console.log('🔍 État workflow:', workflowState);
      
    } catch (err: any) {
      console.error('❌ Erreur vérification workflow:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer un super admin
  const createSuperAdmin = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => {
    try {
      const { data: result, error } = await (supabase as any).rpc('create_super_admin_complete', {
        p_email: data.email,
        p_password: data.password,
        p_name: data.name,
        p_phone: data.phone || null
      });

      if (error) throw error;

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Super Admin créé avec succès!');
      await checkWorkflowState();
      
      return result;
    } catch (error: any) {
      console.error('❌ Erreur création Super Admin:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Créer un admin
  const createAdmin = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    pricingPlan: string;
  }) => {
    try {
      const { data: result, error } = await (supabase as any).rpc('create_admin_complete', {
        p_email: data.email,
        p_password: data.password,
        p_name: data.name,
        p_phone: data.phone || null,
        p_pricing_plan: data.pricingPlan
      });

      if (error) throw error;

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Admin créé avec succès!');
      await checkWorkflowState();
      
      return result;
    } catch (error: any) {
      console.error('❌ Erreur création Admin:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Créer une organisation
  const createOrganization = async (data: {
    name: string;
    address?: string;
  }) => {
    try {
      const { data: result, error } = await (supabase as any).rpc('create_organization_complete', {
        p_name: data.name,
        p_address: data.address || null
      });

      if (error) throw error;

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Organisation créée avec succès!');
      await checkWorkflowState();
      
      return result;
    } catch (error: any) {
      console.error('❌ Erreur création Organisation:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Valider le SMS
  const validateSMS = async (code: string, phone?: string) => {
    try {
      const { data: result, error } = await (supabase as any).rpc('validate_sms_code', {
        p_code: code,
        p_phone: phone || null
      });

      if (error) throw error;

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Code SMS validé!');
      await checkWorkflowState();
      
      return result;
    } catch (error: any) {
      console.error('❌ Erreur validation SMS:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Créer un garage
  const createGarage = async (data: {
    name: string;
    address?: string;
    phone?: string;
  }) => {
    try {
      const { data: result, error } = await (supabase as any).rpc('create_garage_complete', {
        p_name: data.name,
        p_address: data.address || null,
        p_phone: data.phone || null
      });

      if (error) throw error;

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Garage créé avec succès!');
      await checkWorkflowState();
      
      return result;
    } catch (error: any) {
      console.error('❌ Erreur création Garage:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Initialiser au montage
  useEffect(() => {
    checkWorkflowState();
  }, [checkWorkflowState]);

  return {
    currentStep,
    isLoading,
    error,
    checkWorkflowState,
    createSuperAdmin,
    createAdmin,
    createOrganization,
    validateSMS,
    createGarage
  };
};
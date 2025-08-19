import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
// import { supabase } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { WorkflowStep } from '@/types/workflow.types';

interface WorkflowCheckResult {
  isChecking: boolean;
  currentStep: WorkflowStep;
  error?: string;
}

export function useWorkflowCheck(): WorkflowCheckResult {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('init');
  const [error, setError] = useState<string>();

  useEffect(() => {
    const checkWorkflowStatus = async () => {
      try {
        // Vérifier l'utilisateur authentifié
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Vérifier l'organisation
        const { data: organization, error: orgError } = await supabase
          .from('organisations')
          .select('*')
          .maybeSingle();

        if (orgError) throw orgError;

        // Vérifier le rôle de l'utilisateur
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        // Si l'organisation existe et l'utilisateur est admin
        if (organization && userProfile?.role === 'admin') {
          navigate('/dashboard', { replace: true });
          return;
        }

      } catch (error) {
        console.error('Erreur workflow check:', error);
        toast.error("Erreur de vérification du workflow");
        setError("Erreur de vérification du workflow");
      } finally {
        setIsChecking(false);
      }
    };

    checkWorkflowStatus();
  }, [navigate]);

  return {
    isChecking,
    currentStep,
    error
  };
}
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlanDetails, PlanType } from '@/types/workflow.types';
import { toast } from 'sonner';

export const usePlanManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePlanSelection = async (planDetails: PlanDetails): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('plan_selections')
        .insert({
          user_id: user.id,
          plan_id: planDetails.id,
          plan_details: planDetails,
          selected_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return true;

    } catch (err) {
      console.error('❌ Erreur sauvegarde plan:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  return {
    isLoading,
    error,
    savePlanSelection
  };
};
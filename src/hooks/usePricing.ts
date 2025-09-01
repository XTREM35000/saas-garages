import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingData {
  pricing_month: number;
  pricing_year: number;
  pricing_license: number;
}

export function usePricing() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const { data, error } = await supabase
          .from('pricing_config')
          .select('*')
          .single();

        if (error) throw error;

        setPricing(data);
      } catch (error) {
        console.error('❌ Erreur chargement pricing:', error);
        setPricing({
          pricing_month: 25000,
          pricing_year: 250000,
          pricing_license: 1000000
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPricing();
  }, []);

  return { pricing, loading };
}

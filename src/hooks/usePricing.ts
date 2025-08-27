import { useState, useEffect } from 'react';

interface PricingData {
  pricing_month: number;
  pricing_year: number;
}

interface UsePricingReturn {
  pricing: PricingData | null;
  loading: boolean;
  error: string | null;
  updatePricing: (monthly: number, yearly: number) => Promise<boolean>;
  refreshPricing: () => Promise<void>;
}

// État global pour les prix (simulation d'une base de données)
let globalPricing: PricingData = {
  pricing_month: 75000,
  pricing_year: 500000
};

// Événements personnalisés pour la synchronisation
const PRICING_UPDATE_EVENT = 'pricing-updated';

export const usePricing = (): UsePricingReturn => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulation d'un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500));

      setPricing(globalPricing);
    } catch (err) {
      console.error('Erreur lors de la récupération des prix:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setPricing(globalPricing);
    } finally {
      setLoading(false);
    }
  };

  const updatePricing = async (monthly: number, yearly: number): Promise<boolean> => {
    try {
      setError(null);

      // Simulation d'un délai de mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mise à jour de l'état global
      globalPricing = {
        pricing_month: monthly,
        pricing_year: yearly
      };

      // Mise à jour de l'état local
      setPricing(globalPricing);

      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent(PRICING_UPDATE_EVENT, {
        detail: globalPricing
      }));

      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour des prix:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      return false;
    }
  };

  const refreshPricing = async () => {
    await fetchPricing();
  };

  useEffect(() => {
    fetchPricing();

    // Écouter les mises à jour de prix depuis d'autres composants
    const handlePricingUpdate = (event: CustomEvent) => {
      setPricing(event.detail);
    };

    window.addEventListener(PRICING_UPDATE_EVENT, handlePricingUpdate as EventListener);

    return () => {
      window.removeEventListener(PRICING_UPDATE_EVENT, handlePricingUpdate as EventListener);
    };
  }, []);

  return {
    pricing,
    loading,
    error,
    updatePricing,
    refreshPricing
  };
};

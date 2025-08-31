import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Sparkles, AlertTriangle, Clock, Building, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PricingModalProps, PlanDetails, PlanType } from '@/types/workflow.types';
import { LucideIcon } from 'lucide-react';

type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular: boolean;
  icon: LucideIcon;
  cardGradient: string;
  buttonColors: {
    bg: string;
    hover: string;
    text: string;
  };
};

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // Ajout du state manquant
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelect = async (plan: PricingPlan) => {
    try {
      setSelectedPlan(plan.id); // Maintenant setSelectedPlan est défini
      setIsLoading(true);

      // 1. Vérifier l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Veuillez d\'abord créer votre compte');
      }

      console.log('🔄 Sélection du plan:', plan.name);

      // 2. Créer l'objet planDetails
      const planDetails: PlanDetails = {
        id: plan.id as PlanType,
        name: plan.name,
        price: plan.price,
        duration: getDurationInDays(plan.period),
        features: plan.features,
        type: plan.id as PlanType,
        limitations: plan.limitations,
        selected_at: new Date().toISOString()
      };

      // 3. Mettre à jour la table admins
      const { error: updateError } = await supabase
        .from('admins')
        .update({
          selected_plan_id: plan.id,
          plan_selected_at: new Date().toISOString(),
          plan_details: planDetails
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Mettre à jour l'état local
      setSelectedPlan(plan.id);

      // 5. Notifier le parent
      await onSelectPlan(planDetails);

      toast.success(`Plan ${plan.name} sélectionné avec succès! 🎉`);

    } catch (err) {
      console.error('❌ Erreur sélection plan:', err);
      const message = err instanceof Error ? err.message : 'Erreur de sélection du plan';
      toast.error(message);
      setSelectedPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction utilitaire pour la conversion de la période
  const getDurationInDays = (period: string): number => {
    const periodMap: Record<string, number> = {
      '7 jours': 7,
      'par mois': 30,
      'par an': 365,
      'perpetuelle': -1
    };

    return periodMap[period] || 0;
  };

  // Example plans array, replace with your actual pricing data or fetch from API/hook
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0',
      period: '7 jours',
      description: 'Essai gratuit avec fonctionnalités limitées.',
      features: ['Gestion de base', 'Support communautaire'],
      limitations: ['Limité à 1 garage', 'Pas d\'export de données'],
      popular: false,
      icon: Sparkles,
      cardGradient: 'from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800',
      buttonColors: { bg: 'bg-gray-500', hover: 'hover:bg-gray-600', text: 'text-white' }
    },
    {
      id: 'monthly',
      name: 'Mensuel',
      price: '5000',
      period: 'par mois',
      description: 'Abonnement mensuel avec toutes les fonctionnalités.',
      features: ['Gestion avancée', 'Support prioritaire', 'Export de données'],
      limitations: [],
      popular: false,
      icon: Zap,
      cardGradient: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800',
      buttonColors: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white' }
    },
    {
      id: 'annual',
      name: 'Annuel',
      price: '50000',
      period: 'par an',
      description: 'Abonnement annuel, économisez 17%.',
      features: ['Toutes les fonctionnalités', 'Support premium', 'Export illimité'],
      limitations: [],
      popular: true,
      icon: Crown,
      cardGradient: 'from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800',
      buttonColors: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', text: 'text-white' }
    },
    {
      id: 'license',
      name: 'Licence perpétuelle',
      price: '150000',
      period: 'perpetuelle',
      description: 'Paiement unique pour une utilisation illimitée.',
      features: ['Toutes les fonctionnalités', 'Support à vie', 'Export illimité'],
      limitations: [],
      popular: false,
      icon: Building,
      cardGradient: 'from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800',
      buttonColors: { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', text: 'text-white' }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 border-blue-200 dark:border-blue-700">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            Choisissez votre formule d'abonnement
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
            Une solution adaptée à chaque taille d'entreprise
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br ${plan.cardGradient} ${isSelected
                  ? 'border-blue-500 shadow-lg ring-2 ring-blue-500 ring-opacity-50 scale-105'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                  } ${plan.popular ? 'lg:scale-105 lg:z-10' : ''}`}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    Le plus populaire
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 w-12 h-12 ${plan.buttonColors.bg} rounded-full flex items-center justify-center shadow-lg`}>
                    <PlanIcon size={24} color="#fff" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {plan.name}
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {plan.price === '0' ? 'Gratuit' : `${plan.price} FCFA`}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        {plan.period !== 'perpetuelle' ? `/${plan.period}` : ''}
                      </span>
                    </div>
                    {plan.id === 'annual' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Économisez 17% vs le mensuel
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm border-b pb-1">
                      Fonctionnalités incluses :
                    </h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 border-b pb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Limitations :
                      </h4>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-amber-700 dark:text-amber-300">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    className={`w-full transition-all duration-300 font-semibold py-3 rounded-lg ${plan.buttonColors.bg} ${plan.buttonColors.hover} ${plan.buttonColors.text} shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isLoading}
                  >
                    {isLoading && isSelected ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Traitement...
                      </div>
                    ) : isSelected ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Sélectionné
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {plan.id === 'free' ? (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Essayer gratuitement
                          </>
                        ) : plan.id === 'license' ? (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Acheter la licence
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Souscrire
                          </>
                        )}
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-lg">
                Avantages inclus dans tous les plans
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div>
                  <p className="mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <strong>Activation immédiate</strong>
                  </p>
                  <p className="mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <strong>Sécurité des données garantie</strong>
                  </p>
                  <p className="mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <strong>Mises à jour incluses</strong>
                  </p>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <strong>Support technique</strong>
                  </p>
                  <p className="mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <strong>Migration facilitée</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <strong>Satisfaction garantie</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
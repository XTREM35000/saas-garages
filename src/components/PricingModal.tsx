import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Sparkles, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { usePricing } from '@/hooks/usePricing';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ComponentType<any>;
  buttonColors: {
    bg: string;
    hover: string;
    text: string;
  };
  cardGradient: string;
}

interface PricingModalProps {
  isOpen: boolean;
  onSelectPlan: (planId: string) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { pricing, loading: pricingLoading } = usePricing();

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0',
      period: '1 semaine',
      description: 'Découvrez notre solution pendant une semaine',
      icon: Star,
      buttonColors: {
        bg: 'bg-green-500',
        hover: 'hover:bg-green-700',
        text: 'text-white'
      },
      cardGradient: 'from-green-50 to-emerald-100',
      features: [
        '1 garage seulement',
        'Gestion de base des véhicules',
        'Suivi des réparations simples',
        'Jusqu\'à 3 utilisateurs',
        'Support par email'
      ],
      limitations: [
        'Durée limitée à 1 semaine',
        'Redirection obligatoire vers plans payants après la période'
      ]
    },
    {
      id: 'monthly',
      name: 'Mensuel',
      price: pricing ? pricing.pricing_month.toLocaleString() : '25 000',
      period: 'par mois',
      description: 'Solution flexible pour votre organisation',
      icon: Zap,
      buttonColors: {
        bg: 'bg-orange-500',
        hover: 'hover:bg-orange-700',
        text: 'text-white'
      },
      cardGradient: 'from-orange-50 to-amber-100',
      popular: true,
      features: [
        '1 organisation',
        '3 instances maximum (garage/lavage-auto/buvette/superette)',
        'Utilisateurs illimités',
        'Toutes les fonctionnalités',
        'Support prioritaire',
        'Sauvegarde automatique',
        'Rapports détaillés',
        'Notifications SMS'
      ],
      limitations: [
        'Limité à 1 organisation',
        'Maximum 3 instances'
      ]
    },
    {
      id: 'annual',
      name: 'Annuel',
      price: pricing ? pricing.pricing_year.toLocaleString() : '250 000',
      period: 'par an',
      description: 'Solution complète pour organisations multiples',
      icon: Crown,
      buttonColors: {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-700',
        text: 'text-white'
      },
      cardGradient: 'from-blue-50 to-indigo-100',
      features: [
        'Organisations multiples',
        'Instances illimitées',
        'Tous les types d\'activités',
        'Fonctionnalités avancées',
        'Support premium 24/7',
        'Formation personnalisée',
        'API d\'intégration',
        'Rapports analytiques avancés',
        'Déploiement multi-sites',
        'Paiement manuel'
      ],
      limitations: []
    }
  ];

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSelectPlan(planId);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 border-blue-200 dark:border-blue-700">


        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            Choisissez votre plan tarifaire
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
            Sélectionnez le plan qui correspond à vos besoins
          </DialogDescription>
          <div className="flex items-center justify-center space-x-2 mt-3">
            <span 
              className="text-xl cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                // Test erreur - simuler une erreur de sélection
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                }, 2000);
              }}
            >😠</span>
            <span 
              className="text-xl cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                // Test succès - simuler une sélection réussie
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  onSelectPlan('monthly');
                }, 1500);
              }}
            >😊</span>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br ${plan.cardGradient} ${
                  isSelected
                    ? 'border-blue-500 shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                } ${plan.popular ? 'lg:scale-105 lg:z-10' : ''}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    Le plus populaire
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 w-12 h-12 ${plan.buttonColors.bg} rounded-full flex items-center justify-center shadow-lg`}>
                    <PlanIcon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {plan.name}
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
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
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      Inclus :
                    </h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
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
                        Activation en cours...
                      </div>
                    ) : isSelected ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Plan activé
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {plan.id === 'free' ? 'Commencer gratuitement' : 'Choisir ce plan'}
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
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-lg">
                Activation immédiate et support garanti
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div>
                  <p className="mb-2">
                    <strong>✓ Activation immédiate</strong> après sélection
                  </p>
                  <p className="mb-2">
                    <strong>✓ Support technique</strong> inclus
                  </p>
                </div>
                <div>
                  <p className="mb-2">
                    <strong>✓ Migration facile</strong> entre les plans
                  </p>
                  <p>
                    <strong>✓ Garantie de satisfaction</strong>
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

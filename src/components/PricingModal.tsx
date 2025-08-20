import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Sparkles, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { BaseModal } from '@/components/ui/base-modal';
import '../styles/whatsapp-theme.css';

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
  color: string;
}

interface PricingModalProps {
  isOpen: boolean;
  onSelectPlan: (planId: string) => Promise<void> | void;
  onComplete?: (data: any) => void;
  onClose?: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onSelectPlan, onComplete, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0',
      period: '1 semaine',
      description: 'Découvrez notre solution pendant une semaine',
      icon: Star,
      color: 'from-green-400 to-green-600',
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
      price: '25 000',
      period: 'par mois',
      description: 'Solution flexible pour votre organisation',
      icon: Zap,
      color: 'from-[#128C7E] to-[#075E54]',
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
      price: '250 000',
      period: 'par an',
      description: 'Solution complète pour organisations multiples',
      icon: Crown,
      color: 'from-purple-500 to-purple-700',
      features: [
        'Organisations multiples',
        'Instances illimitées',
        'Utilisateurs illimités',
        'Toutes les fonctionnalités',
        'Support VIP 24/7',
        'Sauvegarde automatique',
        'Rapports avancés',
        'Notifications SMS + Email',
        'API personnalisée',
        'Formation sur mesure',
        'Déploiement dédié'
      ],
      limitations: [
        'Engagement annuel',
        'Paiement en une fois'
      ]
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      await onSelectPlan(planId);
      if (onComplete) {
        onComplete({ planId, planName: plans.find(p => p.id === planId)?.name });
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      title="Sélection du Plan"
      subtitle="Choisissez votre formule tarifaire"
      maxWidth="max-w-4xl"
      headerGradient="from-blue-500 to-blue-600"
      logoSize={60}
      draggable={true}
      dragConstraints={{ top: -400, bottom: 400 }}
      isFirstModal={true}
    >
      <div className="space-y-6">
        {/* Grille des plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg border-2 hover:border-blue-300 ${
                  plan.popular ? 'ring-2 ring-[#128C7E] ring-opacity-50' : ''
                }`}
                onClick={() => handlePlanSelection(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#128C7E] text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Populaire
                  </Badge>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#128C7E] to-[#075E54] rounded-lg flex items-center justify-center">
                      <PlanIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#128C7E]">
                        {plan.price === '0' ? 'Gratuit' : `${plan.price} FCFA`}
                      </div>
                      <div className="text-gray-600 text-sm">{plan.period}</div>
                    </div>
                  </div>

                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Fonctionnalités */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#128C7E] text-sm uppercase tracking-wide">
                      Fonctionnalités incluses
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-orange-600 text-sm uppercase tracking-wide">
                        Limitations
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bouton de sélection */}
                  <Button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={isLoading}
                    className={`w-full ${plan.popular
                      ? 'btn-whatsapp-primary'
                      : plan.id === 'free'
                        ? 'btn-whatsapp-success'
                        : 'btn-whatsapp-secondary'
                      }`}
                  >
                    {isLoading && selectedPlan === plan.id ? (
                      <span className="flex items-center gap-2">
                        <div className="loading-whatsapp-spinner"></div>
                        Sélection en cours...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {plan.id === 'free' ? (
                          <>
                            <Star className="w-4 h-4" />
                            Commencer gratuitement
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Choisir ce plan
                          </>
                        )}
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info section avec padding ajusté */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#128C7E] mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-[#128C7E] mb-1">
                Informations importantes
              </p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Tous les plans incluent une période d'essai de 7 jours</li>
                <li>• Possibilité de changer de plan à tout moment</li>
                <li>• Support technique inclus dans tous les plans</li>
                <li>• Données sauvegardées automatiquement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default PricingModal;

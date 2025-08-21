import * as React from 'react';
import { useState } from 'react';
import { Check, Star, Zap, Crown, Sparkles, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { WhatsAppCard, WhatsAppCardHeader, WhatsAppCardContent } from '@/components/ui/whatsapp-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
        'Limité aux organisations existantes',
        'Engagement annuel requis'
      ]
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      await onSelectPlan(planId);
      if (onComplete) {
        onComplete({ planId });
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du plan:', error);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <WhatsAppModal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      title="Sélection du Plan"
      description="Choisissez le plan qui correspond le mieux à vos besoins"
      size="xl"
    >
      <div className="space-y-6">
        {/* En-tête avec description */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Plans d'abonnement disponibles
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sélectionnez le plan qui s'adapte le mieux à la taille et aux besoins de votre organisation.
              Tous les plans incluent une période d'essai gratuite de 7 jours.
            </p>
          </div>
        </div>

        {/* Grille des plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isPopular = plan.popular;

            return (
              <WhatsAppCard
                key={plan.id}
                hover={true}
                shadow="lg"
                className={cn(
                  "relative transition-all duration-300",
                  isSelected && "ring-2 ring-[#128C7E] ring-offset-2",
                  isPopular && "border-2 border-[#128C7E]"
                )}
              >
                {/* Badge "Populaire" */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white px-4 py-1 rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Populaire
                    </Badge>
                  </div>
                )}

                <WhatsAppCardHeader>
                  <div className="text-center space-y-3">
                    {/* Icône du plan */}
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                      `bg-gradient-to-r ${plan.color}`
                    )}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Nom et prix */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                      <div className="text-3xl font-bold text-[#128C7E] mb-1">
                        {plan.price === '0' ? 'Gratuit' : `${plan.price} FCFA`}
                      </div>
                      <p className="text-gray-500 text-sm">{plan.period}</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>
                </WhatsAppCardHeader>

                <WhatsAppCardContent>
                  <div className="space-y-4">
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
                    <WhatsAppButton
                      onClick={() => handlePlanSelection(plan.id)}
                      disabled={isLoading}
                      variant={plan.id === 'free' ? 'success' : isPopular ? 'primary' : 'outline'}
                      size="lg"
                      loading={isLoading && selectedPlan === plan.id}
                      fullWidth={true}
                    >
                      {plan.id === 'free' ? (
                        <span className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Commencer gratuitement
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Choisir ce plan
                        </span>
                      )}
                    </WhatsAppButton>
                  </div>
                </WhatsAppCardContent>
              </WhatsAppCard>
            );
          })}
        </div>

        {/* Section d'informations */}
        <WhatsAppCard shadow="sm" className="bg-blue-50 border-blue-200">
          <WhatsAppCardContent>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-[#128C7E] mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-[#128C7E] mb-1">
                  Informations importantes
                </p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Tous les plans incluent une période d'essai de 7 jours</li>
                  <li>• Possibilité de changer de plan à tout moment</li>
                  <li>• Support technique inclus dans tous les plans</li>
                  <li>• Données sauvegardées automatiquement</li>
                </ul>
              </div>
            </div>
          </WhatsAppCardContent>
        </WhatsAppCard>
      </div>
    </WhatsAppModal>
  );
};

export default PricingModal;

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Car,
  Wrench,
  Users,
  BarChart3,
  Shield,
  Zap,
  Star,
  Play,
  MessageCircle,
  HelpCircle,
  FileText,
  Crown,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedLogo from '@/components/AnimatedLogo';
import { usePricing } from '@/hooks/usePricing';

interface HomePageProps {
  onClose: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onClose }) => {
  const { pricing, loading: pricingLoading } = usePricing();
  
  const features = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Gestion Multi-Garages",
      description: "Gérez plusieurs garages depuis une seule interface centralisée"
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: "Suivi Véhicules",
      description: "Historique complet des réparations et maintenance"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestion Clients",
      description: "Base de données clients avec historique des services"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Avancés",
      description: "Tableaux de bord et rapports détaillés"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sécurité Multi-Tenant",
      description: "Isolation complète des données par organisation"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Performance Optimisée",
      description: "Interface rapide et responsive pour tous les appareils"
    }
  ];

  const pricingPlans = [
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
      ],
      popular: false
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
      ],
      popular: true
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
      limitations: [],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Jean Dupont",
      role: "Directeur Garage Auto Plus",
      content: "Multi-Garage-Connect (MGC) a révolutionné notre gestion. Plus de paperasse, tout est digitalisé !",
      rating: 5
    },
    {
      name: "Marie Martin",
      role: "Responsable Réseau",
      content: "La gestion multi-garages est parfaite pour notre réseau de 15 établissements.",
      rating: 5
    },
    {
      name: "Pierre Durand",
      role: "Mécanicien Senior",
      content: "Interface intuitive, je peux me concentrer sur mon travail sans perdre de temps.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <AnimatedLogo size={40} />
              <h1 className="text-2xl font-bold text-[#128C7E]">Multi-Garage-Connect (MGC)</h1>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E] hover:text-white"
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-[#128C7E] mb-6">
              La solution complète pour
              <span className="text-[#25D366]"> gérer vos garages</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Simplifiez la gestion de vos garages automobiles avec notre plateforme SaaS multi-tenant.
              Performance, sécurité et simplicité au service de votre business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#128C7E] hover:bg-[#075E54] text-white px-8 py-3 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Voir la démo
              </Button>
              <Button variant="outline" className="border-[#128C7E] text-[#128C7E] px-8 py-3 text-lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Nous contacter
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-[#128C7E] mb-4">
              Fonctionnalités principales
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement vos garages automobiles
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="text-[#128C7E] mb-4">{feature.icon}</div>
                    <h4 className="text-xl font-semibold text-[#128C7E] mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-[#128C7E] mb-4">
              Plans d'abonnement
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choisissez le plan qui correspond le mieux à vos besoins
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => {
              const PlanIcon = plan.icon;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    className={`relative transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br ${plan.cardGradient} ${
                      plan.popular ? 'lg:scale-105 lg:z-10 border-orange-500 shadow-lg ring-2 ring-orange-500 ring-opacity-50' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                          <Star className="w-3 h-3 mr-1 inline" />
                          Le plus populaire
                        </span>
                      </div>
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
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-3">
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
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <div key={limitationIndex} className="flex items-start gap-3">
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
                        className={`w-full transition-all duration-300 font-semibold py-3 rounded-lg ${plan.buttonColors.bg} ${plan.buttonColors.hover} ${plan.buttonColors.text} shadow-lg hover:shadow-xl`}
                      >
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          {plan.id === 'free' ? 'Commencer gratuitement' : 'Choisir ce plan'}
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
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
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-[#128C7E] mb-4">
              Témoignages clients
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez ce que nos clients disent de Multi-Garage-Connect (MGC)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-[#128C7E]">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support & Help Section */}
      <section className="py-20 bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-[#128C7E] mb-4">
              Aide & Support
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nous sommes là pour vous accompagner à chaque étape
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <HelpCircle className="w-12 h-12 text-[#128C7E] mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-[#128C7E] mb-2">Centre d'aide</h4>
                <p className="text-gray-600 mb-4">Documentation complète et guides d'utilisation</p>
                <Button variant="outline" className="border-[#128C7E] text-[#128C7E]">
                  Accéder à l'aide
                </Button>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <MessageCircle className="w-12 h-12 text-[#128C7E] mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-[#128C7E] mb-2">Support client</h4>
                <p className="text-gray-600 mb-4">Équipe dédiée disponible 24/7</p>
                <Button variant="outline" className="border-[#128C7E] text-[#128C7E]">
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <FileText className="w-12 h-12 text-[#128C7E] mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-[#128C7E] mb-2">Notes de version</h4>
                <p className="text-gray-600 mb-4">Découvrez les dernières améliorations</p>
                <Button variant="outline" className="border-[#128C7E] text-[#128C7E]">
                  Voir le changelog
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#128C7E] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <AnimatedLogo size={32} />
                <h4 className="text-xl font-bold">Multi-Garage-Connect (MGC)</h4>
              </div>
              <p className="text-gray-300">
                La solution complète pour gérer vos garages automobiles
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Produit</h5>
              <ul className="space-y-2 text-gray-300">
                <li>Fonctionnalités</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Intégrations</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-300">
                <li>Centre d'aide</li>
                <li>Contact</li>
                <li>Documentation</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Entreprise</h5>
              <ul className="space-y-2 text-gray-300">
                <li>À propos</li>
                <li>Blog</li>
                <li>Carrières</li>
                <li>Confidentialité</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Multi-Garage-Connect (MGC). Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

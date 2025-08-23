import React from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Car, Wrench, Zap, Users, Shield, Globe, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import AnimatedLogo from '@/components/AnimatedLogo';
import '../styles/whatsapp-theme.css';

interface HomePageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HomePageModal: React.FC<HomePageModalProps> = ({ isOpen, onClose }) => {
  const features = [
    {
      icon: Building2,
      title: 'Gestion Multi-Garages',
      description: 'Centralisez la gestion de plusieurs garages depuis une seule plateforme'
    },
    {
      icon: Car,
      title: 'Suivi Véhicules',
      description: 'Historique complet des interventions et maintenance des véhicules'
    },
    {
      icon: Users,
      title: 'Équipes & Clients',
      description: 'Gérez vos équipes techniques et votre base clients efficacement'
    },
    {
      icon: Wrench,
      title: 'Interventions',
      description: 'Planifiez et suivez les interventions techniques en temps réel'
    },
    {
      icon: Shield,
      title: 'Sécurité & Conformité',
      description: 'Données sécurisées et conformité réglementaire garanties'
    },
    {
      icon: Globe,
      title: 'Multi-Tenant',
      description: 'Architecture cloud pour une scalabilité et isolation parfaite'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Gratuit',
      period: '7 jours',
      features: [
        '1 Garage',
        '5 Utilisateurs',
        'Fonctionnalités de base',
        'Support email'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '29€',
      period: '/mois',
      features: [
        '5 Garages',
        '20 Utilisateurs',
        'Toutes les fonctionnalités',
        'Support prioritaire',
        'API d\'intégration'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '99€',
      period: '/mois',
      features: [
        'Garages illimités',
        'Utilisateurs illimités',
        'Fonctionnalités avancées',
        'Support dédié 24/7',
        'Domaine personnalisé',
        'Intégrations avancées'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Jean Dupont',
      role: 'Directeur Garage AutoPro',
      content: 'Multi-Garage-Connect a révolutionné notre gestion. Nous avons augmenté notre productivité de 40%.',
      rating: 5
    },
    {
      name: 'Marie Martin',
      role: 'Responsable Technique',
      content: 'Interface intuitive et fonctionnalités complètes. Parfait pour nos 3 garages.',
      rating: 5
    },
    {
      name: 'Pierre Durand',
      role: 'Propriétaire Garage Express',
      content: 'Solution professionnelle qui s\'adapte parfaitement à nos besoins. Support excellent.',
      rating: 5
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <WhatsAppModal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <AnimatedLogo size={48} />
            <div>
              <h1 className="text-3xl font-bold text-[#128C7E]">Multi-Garage-Connect (MGC)</h1>
              <p className="text-gray-600">Solution SaaS professionnelle de gestion multi-garages</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex items-center space-x-2 border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E] hover:text-white"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Retour à l'Authentification</span>
          </Button>
        </div>

        {/* Section Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            La solution complète pour la gestion de vos garages
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Centralisez, optimisez et développez votre activité de réparation automobile 
            avec notre plateforme SaaS multi-tenant professionnelle.
          </p>
        </motion.div>

        {/* Section Fonctionnalités */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Fonctionnalités principales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-[#128C7E]/20 hover:border-[#128C7E]">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-[#128C7E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-[#128C7E]" />
                    </div>
                    <CardTitle className="text-lg text-[#128C7E]">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Plans tarifaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${plan.popular ? 'border-[#128C7E] shadow-lg scale-105' : 'border-gray-200'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#128C7E] text-white px-4 py-1 rounded-full text-sm font-medium">
                        Populaire
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-[#128C7E]">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${plan.popular ? 'bg-[#128C7E] hover:bg-[#25D366]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                    >
                      {plan.popular ? 'Commencer maintenant' : 'Choisir ce plan'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section Témoignages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Ce que disent nos clients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5 border-[#128C7E]/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-[#128C7E]">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-center bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Prêt à transformer votre gestion de garage ?</h3>
          <p className="text-lg mb-6 opacity-90">
            Rejoignez des centaines de professionnels qui font confiance à Multi-Garage-Connect
          </p>
          <Button
            onClick={onClose}
            className="bg-white text-[#128C7E] hover:bg-gray-100 text-lg px-8 py-3"
          >
            Commencer maintenant
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-600 mb-2">
            © 2024 Multi-Garage-Connect (MGC). Tous droits réservés.
          </p>
          <p className="text-sm text-gray-500">
            Support : support@garageconnect.com | Documentation : docs.garageconnect.com
          </p>
        </motion.div>
      </div>
    </WhatsAppModal>
  );
};

export default HomePageModal;

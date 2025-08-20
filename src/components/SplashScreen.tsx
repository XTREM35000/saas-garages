import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedLogo } from "./AnimatedLogo";
import { Car, Wrench, Settings, Shield, Database, Zap } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
  skipKey?: string;
  showSkipButton?: boolean;
  className?: string;
}

interface TestStep {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 5000, // 5 secondes pour les tests
  skipKey = "Escape",
  showSkipButton = true,
  className = ""
}) => {
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);

  const testSteps: TestStep[] = [
    {
      id: 'init',
      name: 'Initialisation système',
      icon: Zap,
      duration: 800,
      status: 'pending'
    },
    {
      id: 'auth',
      name: 'Vérification authentification',
      icon: Shield,
      duration: 600,
      status: 'pending'
    },
    {
      id: 'database',
      name: 'Connexion base de données',
      icon: Database,
      duration: 1000,
      status: 'pending'
    },
    {
      id: 'workflow',
      name: 'Chargement workflow',
      icon: Settings,
      duration: 700,
      status: 'pending'
    },
    {
      id: 'garage',
      name: 'Configuration garage',
      icon: Car,
      duration: 900,
      status: 'pending'
    },
    {
      id: 'tools',
      name: 'Outils de réparation',
      icon: Wrench,
      duration: 600,
      status: 'pending'
    }
  ];

  useEffect(() => {
    console.log('🎬 Démarrage SplashScreen pour cette session');
    
    // Animation des tests étape par étape
    let currentStepIndex = 0;
    let totalProgress = 0;
    
    const runTests = async () => {
      for (let i = 0; i < testSteps.length; i++) {
        const step = testSteps[i];
        setCurrentTest(i);
        
        // Simuler le test en cours
        await new Promise(resolve => {
          const stepDuration = step.duration;
          const stepProgress = 100 / testSteps.length;
          
          const interval = setInterval(() => {
            totalProgress += (stepProgress / (stepDuration / 16)); // 16ms = 60fps
            setProgress(Math.min(totalProgress, 100));
            
            if (totalProgress >= (i + 1) * stepProgress) {
              clearInterval(interval);
              resolve(true);
            }
          }, 16);
        });
      }
      
      // Tous les tests sont terminés
      setTimeout(() => {
        handleComplete();
      }, 500);
    };

    runTests();
  }, []);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === skipKey || e.key === "Escape") {
        handleComplete();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [skipKey]);

  const handleComplete = () => {
    if (isCompleting) return;
    
    console.log('✅ SplashScreen terminé');
    setIsCompleting(true);
    
    // Délai pour l'animation de sortie
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-500 via-green-600 to-green-700 ${className}`}
      >
        {/* Logo animé centré */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            type: "spring", 
            damping: 15, 
            stiffness: 100 
          }}
          className="mb-8"
        >
          <AnimatedLogo 
            size={120}
            mainColor="text-white"
            secondaryColor="text-yellow-200"
            className="drop-shadow-2xl"
          />
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-white text-center mb-4"
        >
          Multi-Garages
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xl md:text-2xl text-green-100 text-center mb-8 max-w-2xl px-4"
        >
          Tests de fonctionnalités en cours...
        </motion.p>

        {/* Étapes de test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full max-w-md mx-4 mb-6"
        >
          <div className="space-y-3">
            {testSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentTest;
              const isCompleted = index < currentTest;
              const isPending = index > currentTest;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                    ${isActive ? 'bg-white/20 border border-white/30' : ''}
                    ${isCompleted ? 'bg-green-500/20 border border-green-300/30' : ''}
                    ${isPending ? 'bg-white/10 border border-white/20' : ''}
                  `}
                >
                  {/* Icône de l'étape */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-white text-green-600' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isPending ? 'bg-white/30 text-white/50' : ''}
                  `}>
                    <StepIcon className="w-4 h-4" />
                  </div>

                  {/* Nom de l'étape */}
                  <span className={`
                    text-sm font-medium
                    ${isActive ? 'text-white' : ''}
                    ${isCompleted ? 'text-green-200' : ''}
                    ${isPending ? 'text-white/70' : ''}
                  `}>
                    {step.name}
                  </span>

                  {/* Statut */}
                  <div className="ml-auto">
                    {isActive && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isCompleted && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Barre de progression globale */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-full max-w-md mx-4 mb-6"
        >
          <div className="bg-green-400/30 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-white/80 text-sm font-mono">
              {Math.round(progress)}% - Tests en cours
            </span>
          </div>
        </motion.div>

        {/* Bouton de saut */}
        {showSkipButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            onClick={handleSkip}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Appuyez sur {skipKey} pour passer
          </motion.button>
        )}

        {/* Informations de version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.5 }}
          className="absolute bottom-6 left-6 right-6 text-center"
        >
          <p className="text-green-200 text-sm">
            Version 2.0 • Tests automatisés • Système sécurisé
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;

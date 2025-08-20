import React, { useState, useEffect, useRef } from 'react';
import { SplashScreen } from './SplashScreen';

interface SplashScreenManagerProps {
  children: React.ReactNode;
  duration?: number;
  skipKey?: string;
  showSkipButton?: boolean;
}

export const SplashScreenManager: React.FC<SplashScreenManagerProps> = ({
  children,
  duration = 5000,
  skipKey = "Escape",
  showSkipButton = true
}) => {
  const [showSplash, setShowSplash] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Vérifier si le SplashScreen a déjà été vu
    const hasSeenSplash = localStorage.getItem('splashScreenSeen') === 'true';
    const sessionId = localStorage.getItem('sessionId');
    
    // Si pas de session ID ou SplashScreen jamais vu, l'afficher
    if (!sessionId || !hasSeenSplash) {
      console.log('🎬 Affichage SplashScreen: nouvelle session ou première visite');
      setShowSplash(true);
      
      // Créer un nouvel ID de session
      if (!sessionId) {
        localStorage.setItem('sessionId', Date.now().toString());
      }
    } else {
      console.log('🚀 SplashScreen déjà vu, passage direct');
    }
  }, []); // Dépendances vides pour ne s'exécuter qu'une fois au montage

  const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem('splashScreenSeen', 'true');
  };

  if (showSplash) {
    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        duration={duration}
        skipKey={skipKey}
        showSkipButton={showSkipButton}
      />
    );
  }

  return <>{children}</>;
};

export default SplashScreenManager;

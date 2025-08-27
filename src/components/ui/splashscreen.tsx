import { useEffect, useState } from "react";
import { AnimatedLogo } from "./animated-logo";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Délai pour l'animation de sortie
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-primary flex items-center justify-center z-50 animate-fade-out">
        <div className="text-center animate-scale-out">
          <AnimatedLogo size="lg" />
          <h1 className="text-3xl font-bold text-white mt-6">GarageFlow</h1>
          <p className="text-white/80 mt-2">Multi-Tenant Garage Management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-primary flex items-center justify-center z-50">
      <div className="text-center animate-fade-in">
        <AnimatedLogo size="lg" />
        <h1 className="text-3xl font-bold text-white mt-6">GarageFlow</h1>
        <p className="text-white/80 mt-2">Multi-Tenant Garage Management</p>
        <div className="mt-8">
          <div className="animate-pulse">
            <div className="w-16 h-1 bg-white/30 rounded-full mx-auto">
              <div className="h-full bg-white rounded-full animate-[scale_1s_ease-in-out_infinite] origin-left"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
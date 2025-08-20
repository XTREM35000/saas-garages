// components/AnimatedLogo.tsx

import {
  Car,
  Wrench,
  Settings,
  Car as CarIcon,
  Cog,
  SprayCan,
  Hammer,
  Gauge,
  LucideIcon
} from 'lucide-react';

// Ajout d'animations spécifiques à l'automobile
const carAnimations = {
  idle: 'animate-bounce-slow',
  repair: 'animate-wrench-rotate',
  service: 'animate-spin-slow',
  paint: 'animate-spray',
  gauge: 'animate-pulse'
};

interface AnimatedLogoProps {
  size?: number;
  mainIcon?: LucideIcon;
  secondaryIcon?: LucideIcon;
  mainColor?: string;
  secondaryColor?: string;
  waterDrop?: boolean;
  animation?: keyof typeof carAnimations;
  className?: string;
}

export function AnimatedLogo({
  size = 56, // 56px par défaut (w-14 h-14)
  mainIcon: MainIcon = Car,
  secondaryIcon: SecondaryIcon = Wrench,
  mainColor = "text-white",
  secondaryColor = "text-yellow-300",
  waterDrop = true,
  className = ""
}: AnimatedLogoProps) {
  // Calculer les tailles relatives
  const mainIconSize = Math.round(size * 0.71); // ~10/14 de la taille totale
  const secondaryIconSize = Math.round(size * 0.43); // ~6/14 de la taille totale
  const pointSize = Math.round(size * 0.21); // ~3/14 de la taille totale

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Fond avec effet goutte d'eau */}
      {waterDrop && (
        <div className="absolute inset-0 bg-black/20 rounded-full blur-sm transform -translate-y-1"></div>
      )}

      {/* Icône principale avec animation */}
      <MainIcon 
        className={`
          ${mainColor} 
          absolute inset-0 m-auto 
          transform hover:scale-110 transition-transform
          ${MainIcon === Car ? 'animate-car-idle' : 'animate-pulse'}
        `}
        style={{ width: mainIconSize, height: mainIconSize }}
      />

      {/* Icône secondaire avec animation */}
      <SecondaryIcon 
        className={`
          ${secondaryColor} 
          absolute top-0 right-0
          ${SecondaryIcon === Wrench ? 'animate-wrench' : 'animate-spin-slow'}
        `}
        style={{ width: secondaryIconSize, height: secondaryIconSize }}
      />

      {/* Point lumineux */}
      <div 
        className="absolute -bottom-1 -right-1 bg-green-400 rounded-full animate-ping"
        style={{ width: pointSize, height: pointSize }}
      />
    </div>
  );
}

export default AnimatedLogo;
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
  mainIcon?: LucideIcon;
  secondaryIcon?: LucideIcon;
  mainColor?: string;
  secondaryColor?: string;
  waterDrop?: boolean;
  animation?: keyof typeof carAnimations;
}

export function AnimatedLogo({
  mainIcon: MainIcon = Car,
  secondaryIcon: SecondaryIcon = Wrench,
  mainColor = "text-white",
  secondaryColor = "text-yellow-300",
  waterDrop = true
}: AnimatedLogoProps) {
  return (
    <div className="relative w-14 h-14">
      {/* Fond avec effet goutte d'eau */}
      {waterDrop && (
        <div className="absolute inset-0 bg-black/20 rounded-full blur-sm transform -translate-y-1"></div>
      )}

      {/* Icône principale avec animation */}
      <MainIcon className={`
        w-10 h-10 
        ${mainColor} 
        absolute inset-0 m-auto 
        transform hover:scale-110 transition-transform
        ${MainIcon === Car ? 'animate-car-idle' : 'animate-pulse'}
      `} />

      {/* Icône secondaire avec animation */}
      <SecondaryIcon className={`
        w-6 h-6 
        ${secondaryColor} 
        absolute top-0 right-0
        ${SecondaryIcon === Wrench ? 'animate-wrench' : 'animate-spin-slow'}
      `} />

      {/* Point lumineux */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
    </div>
  );
}

export default AnimatedLogo;
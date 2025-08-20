import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedLogo } from './AnimatedLogo';

interface AnimatedLogoOverlayProps {
  className?: string;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDelay?: number;
}

export const AnimatedLogoOverlay: React.FC<AnimatedLogoOverlayProps> = ({
  className = "",
  size = 48,
  position = 'top-left',
  showDelay = 1000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher le logo après un délai
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [showDelay]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 left-4';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            duration: 0.6, 
            ease: "easeOut",
            type: "spring",
            stiffness: 200
          }}
          className={`fixed ${getPositionClasses()} z-40 ${className}`}
        >
          <AnimatedLogo 
            size={size}
            mainColor="text-green-600"
            secondaryColor="text-blue-500"
            className="drop-shadow-lg hover:scale-110 transition-transform duration-200"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedLogoOverlay;

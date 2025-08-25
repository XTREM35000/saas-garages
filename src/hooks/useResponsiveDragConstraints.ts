import { useState, useEffect } from 'react';

interface DragConstraints {
  top: number;
  bottom: number;
}

/**
 * Hook pour calculer automatiquement les limites de drag du modal
 * selon la taille de l'écran et la hauteur du contenu
 */
export const useResponsiveDragConstraints = (modalHeight: number = 600): DragConstraints => {
  const [constraints, setConstraints] = useState<DragConstraints>({ top: -280, bottom: 270 });

  const calculateConstraints = () => {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    // Calcul basé sur la hauteur de l'écran
    let topLimit: number;
    let bottomLimit: number;

    if (screenHeight >= 1080) {
      // Écran Desktop (1920x1080+)
      topLimit = -280;
      bottomLimit = 270;
    } else if (screenHeight >= 900) {
      // Écran Laptop (1366x768 - 1920x1080)
      topLimit = -300;
      bottomLimit = 300;
    } else if (screenHeight >= 768) {
      // Écran Tablet (768x1024)
      topLimit = -180;
      bottomLimit = 180;
    } else if (screenHeight >= 667) {
      // Écran Mobile Large (375x667)
      topLimit = -150;
      bottomLimit = 150;
    } else {
      // Écran Mobile Small (320x568)
      topLimit = -120;
      bottomLimit = 120;
    }

    // Ajustement pour la largeur (orientation paysage)
    if (screenWidth < screenHeight) {
      // Mode portrait - réduire les limites
      topLimit = Math.round(topLimit * 0.8);
      bottomLimit = Math.round(bottomLimit * 0.8);
    }

    // Ajustement basé sur la hauteur du modal
    const modalRatio = modalHeight / screenHeight;
    if (modalRatio > 0.8) {
      // Modal très haut - augmenter les limites
      topLimit = Math.round(topLimit * 1.2);
      bottomLimit = Math.round(bottomLimit * 1.2);
    } else if (modalRatio < 0.5) {
      // Modal petit - réduire les limites
      topLimit = Math.round(topLimit * 0.8);
      bottomLimit = Math.round(bottomLimit * 0.8);
    }

    return { top: topLimit, bottom: bottomLimit };
  };

  useEffect(() => {
    const updateConstraints = () => {
      setConstraints(calculateConstraints());
    };

    // Calcul initial
    updateConstraints();

    // Écouter les changements de taille
    window.addEventListener('resize', updateConstraints);
    window.addEventListener('orientationchange', updateConstraints);

    return () => {
      window.removeEventListener('resize', updateConstraints);
      window.removeEventListener('orientationchange', updateConstraints);
    };
  }, [modalHeight]);

  return constraints;
};

/**
 * Hook simplifié avec valeurs prédéfinies pour chaque breakpoint
 */
export const useBreakpointDragConstraints = () => {
  const [constraints, setConstraints] = useState({ top: -50, bottom: 100 });

  useEffect(() => {
    const updateConstraints = () => {
      const isMobile = window.innerWidth < 768;
      setConstraints({
        top: -50,
        bottom: isMobile ? 100 : 300 // Réduire la limite de drag sur mobile
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  return constraints;
};

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';
import { AnimatedLogo } from '../AnimatedLogo';
import { cn } from '@/lib/utils';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  logoSize?: number;
  headerGradient?: string;
  className?: string;
  draggable?: boolean;
  dragConstraints?: { top: number; bottom: number };
  isFirstModal?: boolean; // Pour les 2 premiers modals du workflow
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
  showCloseButton = true,
  logoSize = 60,
  headerGradient = "from-blue-500 to-blue-600",
  className = "",
  draggable = false,
  dragConstraints = { top: -350, bottom: 300 },
  isFirstModal = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Verrouiller le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Gestion du drag
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    setDragY(info.offset.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overscroll-contain ${isFirstModal ? 'pt-6' : 'pt-5'}`}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 200 }}
          animate={{ scale: 1, opacity: 1, y: 200 }}
          exit={{ scale: 0.9, opacity: 0, y: 200 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          // Props de drag si activé
          {...(draggable && {
            drag: "y",
            dragConstraints,
            dragElastic: 0.2,
            dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
            onDragStart: handleDragStart,
            onDrag: handleDrag,
            onDragEnd: handleDragEnd,
            style: { y: dragY + 200 }
          })}
          className={cn(
            "relative w-full bg-white rounded-2xl shadow-2xl",
            maxWidth,
            "mx-4",
            draggable && "touch-pan-y",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec logo animé et dégradé */}
          <div className={`bg-gradient-to-r ${headerGradient} p-6 text-center relative overflow-hidden`}>
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse-glow" />

            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <AnimatedLogo size={logoSize} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-white/90 text-sm">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Bouton de fermeture */}
            {showCloseButton && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Contenu étiré - pas de scroll interne */}
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

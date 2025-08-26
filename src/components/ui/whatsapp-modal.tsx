import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  showSuperAdminIndicator?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  showSuperAdminIndicator = false,
  size = 'lg',
  className = ''
}) => {
  const [dragY, setDragY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  // Gestion du drag vertical
  const handleDragStart = () => setIsDragging(true);

  const handleDrag = (event: any, info: PanInfo) => {
    const maxDragY = window.innerWidth <= 768 ? 150 : 200; // plus souple sur mobile
    const clampedY = Math.max(-maxDragY, Math.min(maxDragY, info.offset.y));
    setDragY(clampedY);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.y > 200 && info.velocity.y > 500) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  // Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 0 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.3 }}
          drag="y"
          dragConstraints={{ top: -50, bottom: 300 }}
          dragElastic={0.1}
          dragMomentum={false}
          dragTransition={{ bounceStiffness: 800, bounceDamping: 30 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative w-full bg-white rounded-t-3xl shadow-2xl overflow-visible touch-pan-y cursor-grab active:cursor-grabbing",
            sizeClasses[size],
            className,
            "md:max-h-[90vh]" // limite pour PC
          )}
          style={{
            y: dragY,
            marginTop: window.innerWidth <= 768 ? 0 : '2rem',
            marginBottom: window.innerWidth <= 768 ? 0 : '2rem',
            height: window.innerWidth <= 768 ? '100vh' : 'auto'
          }}
        >
          {/* Handle de drag (visible sur mobile) */}
          {window.innerWidth <= 768 && (
            <div className="flex justify-center pt-3 pb-2 bg-white">
              <div className="w-12 h-1.5 rounded-full bg-[#128C7E]/30" />
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-[#128C7E] to-[#075E54] text-white relative">
            {showSuperAdminIndicator && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold z-10">
                <Crown className="w-4 h-4" />
                Super Admin
              </div>
            )}

            <div className="p-6 text-center">
              {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
              {description && <p className="text-sm opacity-90">{description}</p>}
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white/80 hover:text-white hover:bg-white/20 focus:ring-white/50"
              aria-label="Fermer la modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu principal - direct dans le modal */}
          <div className="bg-gradient-to-b from-white to-gray-50 p-6 overflow-y-auto h-full">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

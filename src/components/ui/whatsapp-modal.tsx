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

  const handleDrag = (_: any, info: PanInfo) => {
    const isMobile = window.innerWidth <= 768;
    const maxDragY = isMobile ? 150 : 200;
    const clampedY = Math.max(-maxDragY, Math.min(maxDragY, info.offset.y));
    setDragY(clampedY);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && info.offset.y > 200 && info.velocity.y > 500) {
      onClose();
    } else {
      setDragY(0);
    }
  };

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

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 0 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          drag={isMobile ? "y" : false}
          dragConstraints={{ top: -50, bottom: 300 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{
            y: dragY,
            height: isMobile ? '100vh' : 'auto',
            margin: isMobile ? 0 : '2rem',
          }}
          className={cn(
            "relative w-full bg-white rounded-3xl shadow-2xl flex flex-col",
            sizeClasses[size],
            className,
            !isMobile && "md:max-h-[90vh] overflow-hidden"
          )}
        >
          {/* Handle drag visible uniquement sur mobile */}
          {isMobile && (
            <div className="flex justify-center pt-3 pb-1 bg-white rounded-t-3xl">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-[#128C7E] to-[#075E54] text-white relative rounded-t-3xl">
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

          {/* Contenu direct */}
          <div className="bg-gradient-to-b from-white to-gray-50 p-6 flex-1 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

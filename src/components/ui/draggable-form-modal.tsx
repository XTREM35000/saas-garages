import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  theme?: 'whatsapp' | 'default';
  draggable?: boolean;
  showSuperAdminIndicator?: boolean;
  className?: string;
}

export const DraggableFormModal: React.FC<DraggableFormModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  theme = 'whatsapp',
  draggable = true,
  showSuperAdminIndicator = false,
  className = ''
}) => {
  const [dragY, setDragY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  // Gestion du drag
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    setDragY(info.offset.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Reset position après un délai
    setTimeout(() => setDragY(0), 100);
  };

  // Gestion de la touche Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

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

  const isWhatsAppTheme = theme === 'whatsapp';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-0 z-50 flex items-end justify-center",
          isWhatsAppTheme ? "p-2 sm:p-4" : "p-4"
        )}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Overlay avec backdrop blur */}
        <div className={cn(
          "absolute inset-0",
          isWhatsAppTheme
            ? "bg-black/40 backdrop-blur-sm"
            : "bg-black/50 backdrop-blur-sm"
        )} />

        {/* Modal */}
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 50
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 50
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            duration: 0.3
          }}
          // Props de drag si activé
          {...(draggable && {
            drag: "y",
            dragConstraints: { top: -400, bottom: 400 },
            dragElastic: 0.2,
            dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
            onDragStart: handleDragStart,
            onDrag: handleDrag,
            onDragEnd: handleDragEnd,
            style: { y: dragY }
          })}
          className={cn(
            "relative w-full bg-white rounded-t-3xl shadow-2xl overflow-hidden",
            isWhatsAppTheme ? "max-w-4xl" : "max-w-2xl",
            draggable ? "touch-pan-y cursor-grab active:cursor-grabbing" : "",
            className
          )}
          style={{
            minHeight: isWhatsAppTheme ? "calc(100vh - 80px)" : "auto",
            ...(draggable && { y: dragY })
          }}
        >
          {/* Handle de drag */}
          {draggable && (
            <div className="flex justify-center pt-3 pb-2">
              <div className={cn(
                "w-12 h-1.5 rounded-full",
                isWhatsAppTheme
                  ? "bg-[#128C7E]/30"
                  : "bg-gray-300"
              )} />
            </div>
          )}

          {/* Header */}
          <div className={cn(
            "relative overflow-hidden",
            isWhatsAppTheme
              ? "bg-gradient-to-r from-[#128C7E] to-[#075E54] text-white"
              : "bg-gray-50 border-b border-gray-200"
          )}>
            {/* Indicateur Super Admin */}
            {showSuperAdminIndicator && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                <Crown className="w-4 h-4" />
                Super Admin
              </div>
            )}

            <div className="p-6 text-center">
              {title && (
                <h2 className={cn(
                  "text-2xl font-bold mb-2",
                  isWhatsAppTheme ? "text-white" : "text-gray-900"
                )}>
                  {title}
                </h2>
              )}
              {description && (
                <p className={cn(
                  "text-sm opacity-90",
                  isWhatsAppTheme ? "text-white/90" : "text-gray-600"
                )}>
                  {description}
                </p>
              )}
            </div>

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
                isWhatsAppTheme
                  ? "text-white/80 hover:text-white hover:bg-white/20 focus:ring-white/50"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
              )}
              aria-label="Fermer la modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className={cn(
            "flex-1 overflow-y-auto",
            isWhatsAppTheme ? "bg-gradient-to-b from-white to-gray-50" : "bg-white"
          )}>
            <div className="p-6">
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

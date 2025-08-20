// src/components/ui/modal.tsx
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  footer?: React.ReactNode;
  maxHeight?: string;
  scrollable?: boolean;
  position?: "center" | "top" | "bottom";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4"
};

const positionClasses = {
  center: "items-center",
  top: "items-start pt-16",
  bottom: "items-end pb-16"
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
  overlayClassName = "",
  contentClassName = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  showHeader = true,
  showFooter = false,
  footer,
  maxHeight = "90vh",
  scrollable = true,
  position = "center"
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Gestion de la touche Escape
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Empêcher le scroll du body
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Gestion du focus et de l'accessibilité
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-0 z-50 flex justify-center",
          positionClasses[position],
          overlayClassName
        )}
        onClick={handleOverlayClick}
      >
        {/* Overlay avec backdrop blur */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ 
            scale: 0.9, 
            opacity: 0,
            y: position === "top" ? -20 : position === "bottom" ? 20 : 0
          }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            y: 0
          }}
          exit={{ 
            scale: 0.9, 
            opacity: 0,
            y: position === "top" ? -20 : position === "bottom" ? 20 : 0
          }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            duration: 0.3
          }}
          className={cn(
            "relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden",
            sizeClasses[size],
            scrollable ? "max-h-[90vh]" : "",
            className
          )}
          style={{ maxHeight: scrollable ? maxHeight : "auto" }}
        >
          {/* Header */}
          {showHeader && (title || description || showCloseButton) && (
            <div className={cn(
              "flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50",
              headerClassName
            )}>
              <div className="flex-1">
                {title && (
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-gray-600">
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Fermer la modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body avec défilement */}
          <div className={cn(
            "flex-1",
            scrollable ? "overflow-y-auto" : "overflow-hidden",
            bodyClassName
          )}>
            <div className="p-6">
              {children}
            </div>
          </div>

          {/* Footer */}
          {showFooter && footer && (
            <div className={cn(
              "p-6 border-t border-gray-200 bg-gray-50",
              footerClassName
            )}>
              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Composant ModalHeader séparé pour plus de flexibilité
export const ModalHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}> = ({ children, className = "", onClose, showCloseButton = true }) => (
  <div className={cn(
    "flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50",
    className
  )}>
    <div className="flex-1">
      {children}
    </div>
    
    {showCloseButton && onClose && (
      <button
        onClick={onClose}
        className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Fermer la modal"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

// Composant ModalBody avec défilement optimisé
export const ModalBody: React.FC<{
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  maxHeight?: string;
}> = ({ children, className = "", scrollable = true, maxHeight = "70vh" }) => (
  <div className={cn(
    "flex-1",
    scrollable ? "overflow-y-auto" : "overflow-hidden",
    className
  )}
  style={{ maxHeight: scrollable ? maxHeight : "auto" }}
  >
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Composant ModalFooter
export const ModalFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={cn(
    "p-6 border-t border-gray-200 bg-gray-50",
    className
  )}>
    {children}
  </div>
);

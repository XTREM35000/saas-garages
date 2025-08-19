// src/components/ui/modal.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  isDraggable?: boolean;
  title?: string;
  description?: string;
}

interface ModalFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitText?: string;
  isLoading?: boolean;
  className?: string;
}

interface ModalGifProps {
  src: string;
  alt: string;
  className?: string;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isDraggable = true,
  title
}: ModalProps) {
  // Gestion du Escape et overflow
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Drag constraints dynamiques selon la taille de l'écran
  const dragTop = -window.innerHeight / 2 + 100;
  const dragBottom = window.innerHeight / 2 - 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag={isDraggable ? "y" : false}
              dragConstraints={{ top: dragTop, bottom: dragBottom }}
              dragElastic={0.2}
              className={cn(
                "w-full max-w-md max-h-[90vh] overflow-auto bg-white rounded-t-2xl shadow-lg touch-none",
                className
              )}
            >
              {/* Barre de drag */}
              {isDraggable && (
                <div className="p-2 cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1.5 mx-auto mb-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
              )}

              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Formulaire modal réutilisable
export const ModalForm: React.FC<ModalFormProps> = ({
  onSubmit,
  children,
  submitText = "Enregistrer",
  isLoading = false,
  className
}) => {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
      {children}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {submitText}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export const ModalGif: React.FC<ModalGifProps> = ({ src, alt, className }) => {
  return (
    <div className={cn("mb-6", className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-48 object-cover rounded-lg shadow-md"
        loading="lazy"
      />
    </div>
  );
};

// Header, Body, Footer réutilisables
export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-b border-gray-200 dark:border-gray-800", className)}>
    {children}
  </div>
);

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div
    className={cn(
      "px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2",
      className
    )}
  >
    {children}
  </div>
);

// Hook pour feedback de soumission
export const useModalFeedback = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSubmit = async (submitFn: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await submitFn();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, showSuccess, handleSubmit };
};

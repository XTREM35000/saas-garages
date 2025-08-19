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
}

interface ModalFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitText?: string;
  isLoading?: boolean;
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
  const STEP_BAR_HEIGHT = 80;

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

          {/* Container pour centrer */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: STEP_BAR_HEIGHT }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag={isDraggable ? "y" : false}
              dragConstraints={{
                top: STEP_BAR_HEIGHT,
                bottom: window.innerHeight - 100
              }}
              dragElastic={0.2}
              className={cn(
                "w-full",  // Enlève max-w-md pour laisser le contrôle aux enfants
                "touch-none",
                className
              )}
            >
              {/* Barre de drag */}
              {isDraggable && (
                <div className="p-2 cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1.5 mx-auto rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
              )}

              {/* Supprime les styles de contenu fixes */}
              {children}
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

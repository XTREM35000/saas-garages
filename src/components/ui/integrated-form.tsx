import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onSubmit: () => void;
  submitText: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  children: React.ReactNode;
}

export const CreationForm: React.FC<CreationFormProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onSubmit,
  submitText,
  isSubmitting,
  canSubmit,
  children
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground text-center">{description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {children}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                En cours...
              </>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
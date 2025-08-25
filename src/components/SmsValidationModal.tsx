import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { WhatsAppModal } from './ui/whatsapp-modal';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';

interface SmsValidationModalProps {
  isOpen: boolean;
  onComplete: (data: any) => void;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
  organizationData: {
    name: string;
    slug: string;
    adminName: string;
  };
  isLoading?: boolean;
}

const SmsValidationModal: React.FC<SmsValidationModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  onSubmit,
  organizationData,
  isLoading = false
}) => {
  const [smsCode, setSmsCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSmsCode('');
      setShowSuccess(false);
      setCountdown(60);
      setCanResend(false);
    }
  }, [isOpen]);

  // Gestion du compte à rebours
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Envoyer le code SMS
  const handleSendSms = async () => {
    try {
      // Simuler l'envoi SMS (en production, appeler l'API SMS)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Code SMS envoyé !');
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du SMS');
    }
  };

  // Valider le code SMS
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!smsCode.trim()) {
      setError('Veuillez entrer le code de validation');
      return;
    }

    try {
      // Validation du code
      if (smsCode !== '1234') {
        throw new Error('Code invalide. Pour le test, utilisez 1234');
      }

      // Log des informations de validation
      console.log('✅ Validation SMS réussie:', {
        code: smsCode,
        organization: organizationData.name,
        slug: organizationData.slug,
        admin: organizationData.adminName
      });

      await onSubmit(smsCode);

      // Afficher un toast de succès
      toast.success(`Organisation ${organizationData.name} activée !`);

      setShowSuccess(true);

      // Attendre 2 secondes avant de compléter
      setTimeout(() => {
        onComplete({
          organizationName: organizationData.name,
          organizationSlug: organizationData.slug,
          adminName: organizationData.adminName,
          verified: true
        });
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur validation SMS:', error);
      setError(error.message || 'Code incorrect');
      toast.error(error.message || 'Code incorrect');
    }
  };

  // Modal de succès
  if (showSuccess) {
    return (
      <WhatsAppModal
        isOpen={isOpen}
        onClose={onClose}
        title="Validation Réussie!"
      >
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4">
            <AnimatedLogo
              mainIcon={CheckCircle}
              secondaryIcon={MessageSquare}
              mainColor="text-whatsapp"
              secondaryColor="text-whatsapp-light"
              waterDrop={true}
            />
          </div>

          <h3 className="text-lg font-semibold text-whatsapp mb-2">
            Plan Tarifaire Activé
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Redirection vers votre espace...
          </p>

          <div className="loading-whatsapp-spinner" />
        </div>
      </WhatsAppModal>
    );
  }

  // Modal de validation
  return (
    <WhatsAppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Validation SMS"
      description={`Validation pour ${organizationData.name}`}
    >
      {/* Logo animé */}
      <div className="w-16 h-16 mx-auto">
        <AnimatedLogo
          mainIcon={MessageSquare}
          secondaryIcon={CheckCircle}
          mainColor="text-whatsapp"
          secondaryColor="text-whatsapp-light"
          waterDrop={true}
        />
      </div>

      {/* Code de test */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 Code de test: <strong>1234</strong>
        </p>
      </div>

      <form onSubmit={handleValidateCode} className="space-y-4">
        {/* Champ de code */}
        <div className="space-y-2">
          <Input
            id="smsCode"
            type="text"
            value={smsCode}
            onChange={(e) => setSmsCode(e.target.value)}
            placeholder="Code à 4 chiffres"
            maxLength={4}
            className="text-center text-2xl font-mono tracking-widest h-14"
            disabled={isLoading}
          />
          {error && (
            <p className="text-sm text-red-500 flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        {/* Bouton de validation */}
        <Button
          type="submit"
          className="w-full btn-whatsapp-primary h-12"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="loading-whatsapp-spinner" />
              Validation en cours...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Valider le code
            </span>
          )}
        </Button>
      </form>

      {/* Informations de l'organisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.building className="w-5 h-5 text-[#128C7E]" />
            <span>Informations de l'organisation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Nom de l'organisation
              </Label>
              <p className="text-lg font-semibold text-gray-900">
                {organizationData.name}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Code d'organisation
              </Label>
              <p className="text-lg font-mono font-semibold text-[#128C7E]">
                {organizationData.slug}
              </p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Administrateur principal
            </Label>
            <p className="text-lg font-semibold text-gray-900">
              {organizationData.adminName}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations de sécurité */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Icons.shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                Pourquoi valider par SMS ?
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Sécurité renforcée</strong> : Protection contre les accès non autorisés</p>
                <p>• <strong>Vérification d'identité</strong> : Confirmation que vous êtes bien le propriétaire du numéro</p>
                <p>• <strong>Notifications importantes</strong> : Alertes de sécurité et informations critiques</p>
                <p>• <strong>Conformité</strong> : Respect des standards de sécurité SaaS</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </WhatsAppModal >
  );
};

export default SmsValidationModal;

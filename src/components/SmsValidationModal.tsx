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

interface SmsValidationModalProps {
  isOpen: boolean;
  onComplete: (data: any) => void;
  organizationName: string;
  organizationCode: string;
  adminName: string;
}

const SmsValidationModal: React.FC<SmsValidationModalProps> = ({
  isOpen,
  onComplete,
  organizationName,
  organizationCode,
  adminName
}) => {
  const [smsCode, setSmsCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSmsCode('');
      setIsLoading(false);
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
    setIsLoading(true);

    try {
      // Simuler l'envoi SMS (en production, appeler l'API SMS)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Code SMS envoyé !');
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du SMS');
    } finally {
      setIsLoading(false);
    }
  };

  // Valider le code SMS
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!smsCode.trim()) {
      toast.error('Veuillez entrer le code SMS');
      return;
    }

    setIsLoading(true);

    try {
      // Simuler la validation (en production, appeler l'API de validation)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Code de test : 123456
      if (smsCode === '123456') {
        setShowSuccess(true);

        setTimeout(() => {
          onComplete({ success: true, message: 'SMS validé avec succès' });
        }, 2000);
      } else {
        toast.error('Code SMS incorrect');
      }
    } catch (error) {
      toast.error('Erreur lors de la validation');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation de succès
  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md mx-auto text-center p-8">
          <div className="animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Icons.check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-4">
              SMS validé ! 🎉
            </h3>
            <p className="text-green-600 mb-6">
              Votre numéro de téléphone a été vérifié avec succès
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700">
                La sécurité de votre compte est maintenant renforcée.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Icons.spinner className="w-4 h-4 animate-spin" />
              <span className="text-sm">Configuration en cours...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl mx-auto p-0 overflow-hidden">
        {/* Header avec gradient WhatsApp */}
        <DialogHeader className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icons.messageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Validation par SMS
              </DialogTitle>
              <p className="text-white/90 mt-1">
                Sécurisez votre compte avec une validation par SMS
              </p>
              <div className="flex items-center space-x-2 mt-2">
                                 <span 
                   className="text-xl cursor-pointer hover:scale-110 transition-transform"
                   onClick={() => {
                     // Test erreur - code SMS invalide
                     setSmsCode('000000');
                   }}
                 >😠</span>
                 <span 
                   className="text-xl cursor-pointer hover:scale-110 transition-transform"
                   onClick={() => {
                     // Test succès - code SMS valide
                     setSmsCode('123456');
                   }}
                 >😊</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu du formulaire */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Informations de l'organisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.building className="w-5 h-5 text-[#128C7E]" />
                  <span>Informations de l'organisation</span>
                </CardTitle>
                <CardDescription>
                  Détails de votre organisation en cours de configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nom de l'organisation</Label>
                    <p className="text-lg font-semibold text-gray-900">{organizationName || 'Organisation'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Code d'organisation</Label>
                    <p className="text-lg font-mono font-semibold text-[#128C7E]">{organizationCode || 'ORG-001'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Administrateur principal</Label>
                  <p className="text-lg font-semibold text-gray-900">{adminName || 'Administrateur'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Validation SMS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.messageSquare className="w-5 h-5 text-[#128C7E]" />
                  <span>Validation par SMS</span>
                </CardTitle>
                <CardDescription>
                  Entrez le code reçu par SMS pour vérifier votre numéro de téléphone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Code SMS */}
                <div className="space-y-4">
                  <Label htmlFor="smsCode" className="text-base font-medium">
                    Code de validation SMS
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      id="smsCode"
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="text-center text-2xl font-mono tracking-widest"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Entrez le code à 6 chiffres reçu par SMS
                  </p>
                </div>

                {/* Bouton d'envoi */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleSendSms}
                    disabled={!canResend || isLoading}
                    variant="outline"
                    className="px-6"
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : canResend ? (
                      <>
                        <Icons.messageSquare className="w-4 h-4 mr-2" />
                        Renvoyer le code
                      </>
                    ) : (
                      <>
                        <Icons.clock className="w-4 h-4 mr-2" />
                        Renvoyer dans {countdown}s
                      </>
                    )}
                  </Button>
                </div>

                {/* Code de test pour le développement */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icons.alertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Mode développement</p>
                      <p>
                        Pour tester, utilisez le code <strong>123456</strong>.
                        En production, un vrai code SMS sera envoyé.
                      </p>
                    </div>
                  </div>
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

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={handleValidateCode}
                disabled={isLoading || !smsCode.trim()}
                className="bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#075E54] hover:to-[#128C7E] px-8"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    Validation en cours...
                  </>
                ) : (
                  <>
                    <Icons.check className="w-4 h-4 mr-2" />
                    Valider le code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmsValidationModal;

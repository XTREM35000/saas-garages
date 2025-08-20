import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Clock, RefreshCw, Check, Phone, Building, User, AlertCircle } from 'lucide-react';
import { BaseModal } from '@/components/ui/base-modal';
import { ModalFormField } from '@/components/ui/modal-form-field';
import { ModalButton } from '@/components/ui/modal-button';
import { PhoneField } from '@/components/ui/phone-field';

export interface SmsValidationModalProps {
  isOpen: boolean;
  onComplete: () => void;
  organizationName?: string;
  organizationCode?: string;
  adminName?: string;
}

const SmsValidationModal: React.FC<SmsValidationModalProps> = ({
  isOpen,
  onComplete,
  organizationName = 'Non défini',
  organizationCode = 'XXX-XXX',
  adminName = 'Non défini'
}) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes en secondes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [formData, setFormData] = useState({
    phone: { value: '', error: '', isValid: false },
    code: { value: '', error: '', isValid: false }
  });

  // Timer countdown
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    switch (field) {
      case 'phone':
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return {
          isValid: phoneRegex.test(value),
          error: !phoneRegex.test(value) ? "Numéro de téléphone invalide" : ""
        };
      case 'code':
        return {
          isValid: value.length === 6 && /^\d{6}$/.test(value),
          error: value.length !== 6 ? "Le code doit contenir 6 chiffres" : ""
        };
      default:
        return { isValid: false, error: "" };
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    const validation = validateField(field, value);
    setFormData(prev => ({
      ...prev,
      [field]: { value, error: validation.error, isValid: validation.isValid }
    }));
  };

  const handleSendCode = async () => {
    if (!formData.phone.isValid) {
      toast.error('Veuillez saisir un numéro de téléphone valide');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Envoi du code SMS via la fonction RPC
      const { error } = await supabase.rpc('send_validation_sms', {
        phone_number: formData.phone.value,
        user_id: user.id
      });

      if (error) throw error;

      toast.success('Code envoyé avec succès!');
      setStep('code');
      setTimeLeft(15 * 60); // Reset timer

    } catch (error: any) {
      console.error('❌ Erreur envoi SMS:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.code.isValid) {
      toast.error('Veuillez saisir un code valide');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Vérification du code SMS
      const { error } = await supabase.rpc('verify_sms_code', {
        phone_number: formData.phone.value,
        sms_code: formData.code.value,
        user_id: user.id
      });

      if (error) throw error;

      toast.success('Numéro de téléphone validé avec succès!');
      onComplete();

    } catch (error: any) {
      console.error('❌ Erreur vérification SMS:', error);
      setError(error.message || 'Code invalide');
      toast.error(error.message || 'Code invalide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    await handleSendCode();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onComplete}
      title="Validation SMS"
      subtitle="Vérifiez votre numéro de téléphone"
      maxWidth="max-w-md"
      headerGradient="from-blue-500 to-blue-600"
      logoSize={60}
    >
      <div className="space-y-6">
        {/* Informations de l'organisation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{organizationName}</p>
              <p className="text-xs">Code: {organizationCode}</p>
              <p className="text-xs">Admin: {adminName}</p>
            </div>
          </div>
        </div>

        {step === 'phone' ? (
          <div className="space-y-6">
            {/* Numéro de téléphone */}
            <PhoneField
              label="Numéro de téléphone"
              value={formData.phone.value}
              onChange={(value) => handleFieldChange("phone", value)}
              error={formData.phone.error}
              required
              disabled={isSubmitting}
            />

            {/* Bouton d'envoi */}
            <ModalButton
              onClick={handleSendCode}
              disabled={!formData.phone.isValid || isSubmitting}
              loading={isSubmitting}
              loadingText="Envoi en cours..."
              icon={<Phone className="w-5 h-5" />}
            >
              Envoyer le code
            </ModalButton>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Code SMS */}
            <ModalFormField
              id="code"
              label="Code de vérification"
              type="text"
              value={formData.code.value}
              onChange={(value) => handleFieldChange("code", value)}
              placeholder="123456"
              error={formData.code.error}
              isValid={formData.code.isValid}
              disabled={isSubmitting}
              required
              icon={<Shield className="w-4 h-4" />}
            />

            {/* Timer */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Temps restant: {formatTime(timeLeft)}</span>
              </div>
              {timeLeft === 0 && (
                <button
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renvoyer
                </button>
              )}
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Erreur</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3">
              <ModalButton
                onClick={() => setStep('phone')}
                variant="secondary"
                disabled={isSubmitting}
                fullWidth={false}
              >
                Retour
              </ModalButton>
              <ModalButton
                onClick={handleVerifyCode}
                disabled={!formData.code.isValid || isSubmitting}
                loading={isSubmitting}
                loadingText="Vérification..."
                icon={<Check className="w-5 h-5" />}
              >
                Vérifier
              </ModalButton>
            </div>
          </div>
        )}

        {/* Informations */}
        <div className="modal-info-section">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Sécurité renforcée</p>
              <p>Cette validation garantit que vous êtes bien le propriétaire de ce numéro de téléphone.</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default SmsValidationModal;
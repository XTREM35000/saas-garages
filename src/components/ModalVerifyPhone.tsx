import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
import { toast } from 'sonner';
import '../styles/whatsapp-theme.css';

interface ModalVerifyPhoneProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  phone?: string;
}

export const ModalVerifyPhone: React.FC<ModalVerifyPhoneProps> = ({
  isOpen,
  onClose,
  onVerifySuccess,
  phone
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setIsVerified(false);
      // Focus sur le premier input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Empêcher plus d'un caractère

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Passer au champ suivant si une valeur est saisie
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Passer au champ précédent si on efface
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Veuillez saisir le code à 6 chiffres');
      return;
    }

    setIsLoading(true);

    try {
      // Simuler la vérification OTP SMS (à implémenter avec votre service SMS)
      // Ici on simule un délai et une vérification réussie
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Code de test : 654321
      if (otpString === '654321') {
        setIsVerified(true);
        toast.success('Code SMS vérifié ! 📱');
        
        // Attendre un peu avant de passer à l'étape suivante
        setTimeout(() => {
          onVerifySuccess();
        }, 1000);
      } else {
        toast.error('Code incorrect. Veuillez réessayer.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('❌ Erreur vérification SMS:', error);
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = () => {
    toast.info('Nouveau code SMS envoyé ! 📱');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <WhatsAppModal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-500 hover:text-[#128C7E]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center">
              <Phone className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#128C7E] mb-2">
            Vérification SMS
          </h2>
          <p className="text-gray-600">
            Un code de vérification vous a été envoyé par SMS
          </p>
          {phone && (
            <p className="text-sm text-[#128C7E] font-medium mt-1">
              {phone}
            </p>
          )}
        </div>

        {/* Formulaire */}
        <Card className="modal-whatsapp-card">
          <CardContent className="space-y-6 pt-6">
            {/* Code OTP */}
            <div className="space-y-4">
              <Label className="text-[#128C7E] font-medium text-center block">
                Entrez le code à 6 chiffres
              </Label>
              
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 focus:border-[#128C7E] focus:ring-2 focus:ring-[#128C7E]/20"
                    disabled={isLoading || isVerified}
                  />
                ))}
              </div>
            </div>

            {/* Bouton vérifier */}
            <Button
              onClick={handleVerify}
              disabled={isLoading || isVerified || otp.join('').length !== 6}
              className="btn-whatsapp-primary w-full py-3"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Vérification...
                </div>
              ) : isVerified ? (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Vérifié !
                </div>
              ) : (
                'Vérifier'
              )}
            </Button>

            {/* Lien renvoyer code */}
            <div className="text-center">
              <button
                onClick={resendCode}
                disabled={isLoading}
                className="text-[#128C7E] hover:text-[#25D366] text-sm font-medium transition-colors"
              >
                Renvoyer le code
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </WhatsAppModal>
  );
};

export default ModalVerifyPhone;

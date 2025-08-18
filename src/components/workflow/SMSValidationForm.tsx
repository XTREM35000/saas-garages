import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';

interface SMSValidationFormProps {
  onSubmit: (code: string) => Promise<void>;
  isLoading?: boolean;
}

export const SMSValidationForm: React.FC<SMSValidationFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [code, setCode] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!code.trim()) {
      setError('Veuillez entrer le code de validation');
      return;
    }

    try {
      await onSubmit(code);
      setIsValidated(true);
    } catch (error: any) {
      setError(error.message || 'Code incorrect');
    }
  };

  if (isValidated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-background border-border">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <AnimatedLogo
                mainIcon={CheckCircle}
                secondaryIcon={MessageSquare}
                mainColor="text-green-500"
                secondaryColor="text-green-400"
                waterDrop={true}
              />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Validation Réussie!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Votre plan tarifaire a été activé
            </p>
            
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background border-border">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="w-16 h-16 mx-auto">
            <AnimatedLogo
              mainIcon={MessageSquare}
              secondaryIcon={CheckCircle}
              mainColor="text-primary"
              secondaryColor="text-secondary"
              waterDrop={true}
            />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">
              Validation SMS
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Entrez le code reçu par SMS
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 Code de test: <strong>1234</strong>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code SMS */}
            <div className="space-y-2">
              <Label htmlFor="code" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Code de validation
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Entrez le code à 4 chiffres"
                maxLength={4}
                className={`text-center text-lg font-mono ${error ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Validation en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Valider le Code
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
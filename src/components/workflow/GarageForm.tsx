import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, MapPin, Phone, AlertCircle } from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';

interface GarageFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const GarageForm: React.FC<GarageFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du garage est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur soumission:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background border-border">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="w-16 h-16 mx-auto">
            <AnimatedLogo
              mainIcon={Car}
              secondaryIcon={MapPin}
              mainColor="text-primary"
              secondaryColor="text-secondary"
              waterDrop={true}
            />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">
              Configuration Garage
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Dernière étape : configurez votre garage
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom du garage */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Nom du garage
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Garage Auto Plus"
                className={errors.name ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse (optionnel)
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Avenue des Mécaniciens"
                disabled={isLoading}
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone (optionnel)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="01 23 45 67 89"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Créer Garage
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
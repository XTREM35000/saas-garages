import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, MapPin, Phone, AlertCircle, Mail, Globe, FileText, Navigation } from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GarageFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  description: string;
}

interface ValidationErrors {
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

export const GarageForm: React.FC<GarageFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
    email: '',
    website: '',
    description: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Validation des champs
  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Le nom du garage est obligatoire';
        if (value.length < 3) return 'Le nom doit contenir au moins 3 caractères';
        break;

      case 'address':
        if (!value.trim()) return 'L\'adresse est obligatoire';
        if (value.length < 10) return 'L\'adresse doit contenir au moins 10 caractères';
        break;

      case 'city':
        if (!value.trim()) return 'La ville est obligatoire';
        if (value.length < 2) return 'La ville doit contenir au moins 2 caractères';
        break;

      case 'postalCode':
        if (!value.trim()) return 'Le code postal est obligatoire';
        if (!/^[0-9]{5}$/.test(value)) return 'Le code postal doit contenir 5 chiffres';
        break;

      case 'phone':
        if (value.trim() && !/^(\+33|0)[1-9](\d{8})$/.test(value)) {
          return 'Format de téléphone invalide (ex: +33123456789 ou 0123456789)';
        }
        break;

      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Format d\'email invalide';
        }
        break;
    }
    return undefined;
  };

  // Validation complète du formulaire
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      const error = validateField(field as keyof FormData, formData[field as keyof FormData]);
      if (error) {
        newErrors[field as keyof FormData] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Gestion des changements de champs
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Valider le champ en temps réel
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Géolocalisation automatique
  const handleAutoLocate = async () => {
    setIsLocating(true);

    try {
      if (!navigator.geolocation) {
        toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      setCoordinates({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });

      toast.success('Géolocalisation réussie !');
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      toast.error('Impossible de récupérer votre position. Veuillez la saisir manuellement.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      // Ajouter les coordonnées GPS aux données
      const submitData = {
        ...formData,
        coordinates
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erreur soumission:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl bg-background border-border max-h-[90vh] overflow-y-auto">
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
              Configuration du Premier Garage
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configurez votre premier garage avec toutes les informations nécessaires
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Nom du garage *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Ex: Garage Central, Auto Service Plus..."
                  className={cn(errors.name && "border-red-500 focus:border-red-500")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description (optionnel)
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Décrivez votre garage, vos spécialités, vos services..."
                  maxLength={500}
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formData.description.length}/500 caractères</span>
                </div>
              </div>
            </div>

            {/* Adresse et localisation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse et localisation
              </h3>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse complète *
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Ex: 123 Rue de la Paix, Zone Industrielle..."
                  className={cn(errors.address && "border-red-500 focus:border-red-500")}
                  disabled={isLoading}
                />
                {errors.address && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="Ex: Paris, Lyon, Marseille..."
                    className={cn(errors.city && "border-red-500 focus:border-red-500")}
                    disabled={isLoading}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                    placeholder="75001"
                    maxLength={5}
                    className={cn(errors.postalCode && "border-red-500 focus:border-red-500")}
                    disabled={isLoading}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.postalCode}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Canada">Canada</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Géolocalisation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Géolocalisation
                    </h4>
                    <p className="text-sm text-blue-700">
                      Récupérez automatiquement les coordonnées GPS de votre garage
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAutoLocate}
                    disabled={isLocating || isLoading}
                    variant="outline"
                    size="sm"
                    className="bg-white"
                  >
                    {isLocating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Localisation...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        Localiser
                      </>
                    )}
                  </Button>
                </div>

                {coordinates && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm font-mono text-blue-700">
                      Coordonnées GPS : {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact et informations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact et informations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+33123456789 ou 0123456789"
                    className={cn(errors.phone && "border-red-500 focus:border-red-500")}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="contact@garage.com"
                    className={cn(errors.email && "border-red-500 focus:border-red-500")}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Site web (optionnel)
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  placeholder="https://www.mon-garage.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !validateForm()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Créer le Garage
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

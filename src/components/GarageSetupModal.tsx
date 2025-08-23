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

interface GarageSetupModalProps {
  isOpen: boolean;
  onComplete: (data: any) => void;
  organizationName: string;
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

const GarageSetupModal: React.FC<GarageSetupModalProps> = ({
  isOpen,
  onComplete,
  organizationName
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
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
      setErrors({});
      setShowSuccess(false);
      setCoordinates(null);
    }
  }, [isOpen]);

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

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);

    try {
      // Récupérer l'ID de l'organisation actuelle
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer l'organisation de l'utilisateur     
      const { data: orgData, error: orgError } = await supabase
        .from('organization_users')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (orgError || !orgData?.organization_id) {
        console.error('Erreur récupération organisation:', orgError);
        throw new Error('Organisation non trouvée');
      }

      // Appeler la fonction RPC Supabase pour créer le garage
      const { data, error } = await supabase.rpc('create_garage', {
        p_organization_id: orgData.organization_id,
        p_name: formData.name,
        p_address: formData.address,
        p_city: formData.city,
        p_postal_code: formData.postalCode,
        p_country: formData.country,
        p_latitude: coordinates?.lat || null,
        p_longitude: coordinates?.lng || null,
        p_phone: formData.phone || null,
        p_email: formData.email || null,
        p_description: formData.description || null
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Afficher l'animation de succès
        setShowSuccess(true);

        // Attendre un peu pour l'animation
        setTimeout(() => {
          onComplete(data);
        }, 2000);
      } else {
        throw new Error('Erreur lors de la création du garage');
      }

    } catch (error: any) {
      console.error('Erreur création garage:', error);
      toast.error(error.message || 'Erreur lors de la création du garage');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation de succès
  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={() => { }}>
        <DialogContent className="max-w-md mx-auto text-center p-8">
          <div className="animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Icons.wrench className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-orange-700 mb-4">
              Garage créé ! 🎉
            </h3>
            <p className="text-orange-600 mb-6">
              {formData.name} est maintenant configuré
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm text-orange-700">
                <p><strong>Adresse :</strong> {formData.address}</p>
                <p><strong>Ville :</strong> {formData.city} {formData.postalCode}</p>
                {coordinates && (
                  <p><strong>Coordonnées :</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <Icons.spinner className="w-4 h-4 animate-spin" />
              <span className="text-sm">Configuration finale...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="max-w-4xl mx-auto p-0 overflow-hidden">
        {/* Header avec gradient WhatsApp */}
        <DialogHeader className="bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icons.wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Configuration du Premier Garage
              </DialogTitle>
              <p className="text-white/90 mt-1">
                Configurez votre premier garage pour {organizationName}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu du formulaire */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.wrench className="w-5 h-5 text-[#128C7E]" />
                  <span>Informations de base</span>
                </CardTitle>
                <CardDescription>
                  Définissez le nom et la description de votre garage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du garage *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={cn(
                      errors.name && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="Ex: Garage Central, Auto Service Plus..."
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Décrivez votre garage, vos spécialités, vos services..."
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formData.description.length}/500 caractères</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adresse et localisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.mapPin className="w-5 h-5 text-[#128C7E]" />
                  <span>Adresse et localisation</span>
                </CardTitle>
                <CardDescription>
                  Définissez l'emplacement de votre garage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className={cn(
                      errors.address && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="Ex: 123 Rue de la Paix, Zone Industrielle..."
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
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
                      className={cn(
                        errors.city && "border-red-500 focus:border-red-500"
                      )}
                      placeholder="Ex: Paris, Lyon, Marseille..."
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal *</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                      className={cn(
                        errors.postalCode && "border-red-500 focus:border-red-500"
                      )}
                      placeholder="75001"
                      maxLength={5}
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-red-500">{errors.postalCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      <h4 className="font-medium text-blue-900">Géolocalisation</h4>
                      <p className="text-sm text-blue-700">
                        Récupérez automatiquement les coordonnées GPS de votre garage
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAutoLocate}
                      disabled={isLocating}
                      variant="outline"
                      size="sm"
                      className="bg-white"
                    >
                      {isLocating ? (
                        <>
                          <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                          Localisation...
                        </>
                      ) : (
                        <>
                          <Icons.mapPin className="w-4 h-4 mr-2" />
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
              </CardContent>
            </Card>

            {/* Contact et informations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.phone className="w-5 h-5 text-[#128C7E]" />
                  <span>Contact et informations</span>
                </CardTitle>
                <CardDescription>
                  Renseignez les informations de contact de votre garage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className={cn(
                        errors.phone && "border-red-500 focus:border-red-500"
                      )}
                      placeholder="+33123456789 ou 0123456789"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={cn(
                        errors.email && "border-red-500 focus:border-red-500"
                      )}
                      placeholder="contact@garage.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web (optionnel)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    placeholder="https://www.mon-garage.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informations sur le garage */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Icons.info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-900">
                      Premier garage de votre organisation
                    </p>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• <strong>Configuration initiale</strong> : Ce garage servira de modèle pour les suivants</p>
                      <p>• <strong>Géolocalisation</strong> : Permet aux clients de vous trouver facilement</p>
                      <p>• <strong>Contact</strong> : Informations affichées aux clients</p>
                      <p>• <strong>Personnalisation</strong> : Vous pourrez modifier ces informations plus tard</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#075E54] hover:to-[#128C7E] px-8"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Icons.wrench className="w-4 h-4 mr-2" />
                    Créer le Garage
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GarageSetupModal;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Settings, User, Mail, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';

interface SuperAdminFormProps {
  onSubmit: (data: any) => Promise<{ success: boolean; user_id?: string; error?: string }>;
  isLoading?: boolean;
  onComplete?: (data: any) => void;
}

export const SuperAdminForm: React.FC<SuperAdminFormProps> = ({
  onSubmit,
  isLoading = false,
  onComplete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    else if (formData.name.trim().length < 2) newErrors.name = 'Le nom doit contenir au moins 2 caractères';

    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Format email invalide';

    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (!passwordRegex.test(formData.password)) newErrors.password =
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';

    if (formData.phone && !/^[0-9+\s()-]{8,}$/.test(formData.phone)) newErrors.phone = 'Format de téléphone invalide';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Tentative de soumission du formulaire...');

    if (!validateForm()) {
      console.log('❌ Validation échouée', errors);
      return;
    }

    try {
      setErrors({});
      console.log('✨ Données envoyées au backend:', formData);

      const result = await onSubmit({
        ...formData,
        phone: formData.phone.trim() || null
      });

      console.log('🔍 Résultat RPC:', result);

      if (!result.success) {
        setErrors(prev => ({ ...prev, submit: result.error || 'Erreur serveur inconnue' }));
        toast.error(result.error || 'Erreur lors de la création du Super Admin');
        return;
      }

      toast.success('Super Administrateur créé avec succès ! 🎉');
      if (onComplete) onComplete(result);

    } catch (error: any) {
      console.error('❌ Erreur soumission:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Erreur lors de la création'
      }));
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background border-border">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-end">
            <ThemeToggle size="sm" />
          </div>
          <div className="w-16 h-16 mx-auto">
            <AnimatedLogo
              mainIcon={Crown}
              secondaryIcon={Settings}
              mainColor="text-primary"
              secondaryColor="text-secondary"
              waterDrop
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">
              Création Super Admin
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configurez le propriétaire principal de l'application
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom complet"
                className={errors.name ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.name && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
                className={errors.email ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
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
                placeholder="07 58 96 61 56"
                disabled={isLoading}
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 8 caractères"
                  className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
            </div>

            {/* Erreurs globales */}
            {errors.submit && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded flex items-center gap-1"><AlertCircle className="h-4 w-4" />{errors.submit}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || Object.keys(errors).length > 0}>
              {isLoading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Création en cours...</div>
                : <div className="flex items-center gap-2"><Crown className="h-4 w-4" />Créer Super Admin</div>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

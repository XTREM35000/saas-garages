import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Settings, User, Mail, Phone, Eye, EyeOff, AlertCircle, CreditCard } from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AdminFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const pricingPlans = [
  { value: 'starter', label: 'Starter - 29€/mois', description: 'Parfait pour débuter' },
  { value: 'professional', label: 'Professional - 59€/mois', description: 'Pour les garages établis' },
  { value: 'enterprise', label: 'Enterprise - 99€/mois', description: 'Solution complète' },
];

export const AdminForm: React.FC<AdminFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    pricingPlan: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Format email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }

    if (!formData.pricingPlan) {
      newErrors.pricingPlan = 'Veuillez sélectionner un plan';
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
          {/* Theme Toggle */}
          <div className="flex justify-end">
            <ThemeToggle size="sm" />
          </div>

          {/* Logo */}
          <div className="w-16 h-16 mx-auto">
            <AnimatedLogo
              mainIcon={Shield}
              secondaryIcon={Settings}
              mainColor="text-primary"
              secondaryColor="text-secondary"
              waterDrop={true}
            />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">
              Création Admin
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configurez un compte administrateur avec plan tarifaire
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
                placeholder="Nom de l'administrateur"
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
                placeholder="admin@email.com"
                className={errors.email ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
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
                placeholder="+33 6 12 34 56 78"
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Plan tarifaire */}
            <div className="space-y-2">
              <Label htmlFor="pricingPlan" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Plan tarifaire
              </Label>
              <Select 
                value={formData.pricingPlan} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, pricingPlan: value }))}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.pricingPlan ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Choisir un plan" />
                </SelectTrigger>
                <SelectContent>
                  {pricingPlans.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{plan.label}</span>
                        <span className="text-xs text-muted-foreground">{plan.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pricingPlan && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.pricingPlan}
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
                  Création en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Créer Admin
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
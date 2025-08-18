import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { Crown, Building, Shield, Smartphone, CheckCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Super Admin Modal
export const SuperAdminModal: React.FC<ModalProps & { onComplete: () => void }> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Super Admin créé",
      description: "Propriétaire principal configuré avec succès",
    });
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Initialisation Super Admin</CardTitle>
          <CardDescription>
            Configurez le propriétaire principal de l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Votre nom complet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">
              Créer Super Admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Modal
export const AdminModal: React.FC<ModalProps & { onComplete: () => void }> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    pricingPlan: '' 
  });
  const { toast } = useToast();

  const pricingPlans = [
    { value: 'starter', label: 'Starter - 29€/mois' },
    { value: 'professional', label: 'Professional - 59€/mois' },
    { value: 'enterprise', label: 'Enterprise - 99€/mois' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.pricingPlan) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Admin créé",
      description: `Compte admin configuré avec le plan ${formData.pricingPlan}`,
    });
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Création Admin</CardTitle>
          <CardDescription>
            Configurez un compte administrateur avec plan tarifaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">Nom complet</Label>
              <Input
                id="adminName"
                placeholder="Nom de l'administrateur"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPhone">Téléphone</Label>
              <Input
                id="adminPhone"
                placeholder="+33 6 12 34 56 78"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricingPlan">Plan tarifaire</Label>
              <Select value={formData.pricingPlan} onValueChange={(value) => 
                setFormData({ ...formData, pricingPlan: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un plan" />
                </SelectTrigger>
                <SelectContent>
                  {pricingPlans.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Créer Admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Organization Modal
export const OrganizationModal: React.FC<ModalProps & { onComplete: () => void }> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [formData, setFormData] = useState({ name: '', address: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Le nom de l'organisation est obligatoire",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Organisation créée",
      description: "Organisation configurée avec succès",
    });
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Création Organisation</CardTitle>
          <CardDescription>
            Configurez votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nom de l'organisation</Label>
              <Input
                id="orgName"
                placeholder="Garage Martin & Fils"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgAddress">Adresse</Label>
              <Input
                id="orgAddress"
                placeholder="123 Rue de la Réparation, 75001 Paris"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">
              Créer Organisation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// SMS Validation Modal
export const SMSValidationModal: React.FC<ModalProps & { onComplete: () => void }> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [code, setCode] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const { toast } = useToast();
  
  const correctCode = '1234'; // Simulation

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === correctCode) {
      setIsValidated(true);
      toast({
        title: "Code validé",
        description: "Votre compte a été activé avec succès!",
      });
      setTimeout(() => onComplete(), 1500);
    } else {
      toast({
        title: "Code incorrect",
        description: "Veuillez réessayer avec le bon code",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-scale-in">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
            isValidated ? 'bg-toast-success' : 'bg-gradient-primary'
          }`}>
            {isValidated ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <Smartphone className="h-8 w-8 text-primary-foreground" />
            )}
          </div>
          <CardTitle>
            {isValidated ? 'Validation Réussie!' : 'Validation SMS'}
          </CardTitle>
          <CardDescription>
            {isValidated 
              ? 'Votre plan tarifaire a été activé' 
              : 'Entrez le code reçu par SMS (Code: 1234)'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidated ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smsCode">Code de validation</Label>
                <Input
                  id="smsCode"
                  placeholder="Entrez le code à 4 chiffres"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={4}
                  className="text-center text-lg font-mono"
                />
              </div>
              <Button type="submit" className="w-full">
                Valider le Code
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Redirection vers le dashboard...
              </p>
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Garage Modal
export const GarageModal: React.FC<ModalProps & { onComplete: () => void }> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Le nom du garage est obligatoire",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Garage créé",
      description: "Votre garage a été configuré avec succès!",
    });
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Création Garage</CardTitle>
          <CardDescription>
            Configurez votre premier garage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="garageName">Nom du garage</Label>
              <Input
                id="garageName"
                placeholder="Garage Central"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="garageAddress">Adresse</Label>
              <Input
                id="garageAddress"
                placeholder="456 Avenue des Mécaniciens"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="garagePhone">Téléphone</Label>
              <Input
                id="garagePhone"
                placeholder="+33 1 23 45 67 89"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">
              Créer Garage
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
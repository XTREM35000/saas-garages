import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import {
  Car,
  SprayCan,
  Gauge,
  Wrench, // Remplacer Tool par Wrench
  Settings,
  Crown,
  Shield,
  Building,
  MessageSquare, // Ajout de MessageSquare
  CheckCircle // Ajout de CheckCircle si nécessaire
} from 'lucide-react';
import AnimatedLogo from '../AnimatedLogo';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}



// Super Admin Modal
type SuperAdminResponse = {
  success: boolean;
  user_id: string;
  message: string;
};

export const SuperAdminModal: React.FC<ModalProps & { onComplete: () => void }> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    avatar_url: '',
    theme: 'default'
  });
  const { toast } = useToast();
  const { supabase } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase?.rpc) {
      toast({
        title: "Erreur",
        description: "La connexion à la base de données n'est pas disponible",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Vérifie si on peut créer le premier Super Admin
      const { data: canCreate, error: checkError } = await supabase.rpc('can_create_first_super_admin');
      if (checkError) throw checkError;
      if (!canCreate) {
        toast({
          title: "Erreur",
          description: "Un Super Admin existe déjà",
          variant: "destructive",
        });
        return;
      }

      // Création du Super Admin
      const { data: superAdminData, error: createSAError } = await supabase.rpc('create_super_admin', {
        p_email: formData.email,
        p_name: `${formData.first_name} ${formData.last_name}`,
        p_password: formData.password
      });

      if (createSAError) throw createSAError;

      // Forcer le typage
      const superAdmin = superAdminData as SuperAdminResponse;

      if (!superAdmin || !superAdmin.user_id) {
        throw new Error("Impossible de récupérer l'ID utilisateur du Super Admin créé.");
      }

      // Création du profil associé
      const { data: profile, error: profileError } = await supabase.rpc('create_profile', {
        user_id: superAdmin.user_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        avatar_url: formData.avatar_url,
        theme: formData.theme
      });

      if (profileError) throw profileError;

      toast({
        title: "Super Admin créé",
        description: "Configuration terminée avec succès",
      });

      onComplete();

    } catch (err: any) {
      console.error("Erreur création Super Admin:", err);
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <AnimatedLogo
              mainIcon={Crown}
              secondaryIcon={Settings}
              mainColor="text-primary"
              secondaryColor="text-yellow-400"
              waterDrop={true}
            />
          </div>
          <CardTitle>Initialisation Super Admin</CardTitle>
          <CardDescription>
            Configurez le propriétaire principal de l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="+33 6 12 34 56 78"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
          <div className="w-16 h-16 mx-auto mb-4">
            <AnimatedLogo
              mainIcon={Shield}
              secondaryIcon={Wrench}
              mainColor="text-primary"
              secondaryColor="text-blue-400"
              waterDrop={true}
            />
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
          <div className="w-16 h-16 mx-auto mb-4">
            <AnimatedLogo
              mainIcon={Building}
              secondaryIcon={Settings}
              mainColor="text-primary"
              secondaryColor="text-green-400"
              waterDrop={true}
            />
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
          <div className="w-16 h-16 mx-auto mb-4">
            <AnimatedLogo
              mainIcon={MessageSquare}
              secondaryIcon={CheckCircle}
              mainColor={isValidated ? "text-success" : "text-primary"}
              secondaryColor="text-primary-foreground"
            />
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
          <div className="w-16 h-16 mx-auto mb-4">
            <AnimatedLogo
              mainIcon={Car}
              secondaryIcon={Wrench}
              mainColor="text-primary"
              secondaryColor="text-orange-400"
              waterDrop={true}
            />
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
import React, { useState } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PricingModal from '@/components/PricingModal';
import {
  Calendar,
  Clock,
  Users,
  Car,
  Wrench,
  Package,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  Crown
} from 'lucide-react';

const QuickActions = () => {
  const quickActions = [
    { id: 'new-client', label: 'Nouveau Client', icon: Users, color: 'bg-blue-500' },
    { id: 'new-vehicle', label: 'Enregistrer Véhicule', icon: Car, color: 'bg-green-500' },
    { id: 'new-repair', label: 'Nouvelle Réparation', icon: Wrench, color: 'bg-orange-500' },
    { id: 'schedule-appointment', label: 'Planifier RDV', icon: Calendar, color: 'bg-purple-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Actions Rapides
          <Plus className="h-5 w-5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-primary/5 hover:border-primary/20"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-center">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const TodaySchedule = () => {
  const todayAppointments = [
    { time: '09:00', client: 'M. Dupont', vehicle: 'Renault Clio', service: 'Vidange' },
    { time: '11:30', client: 'Mme Martin', vehicle: 'Peugeot 308', service: 'Révision' },
    { time: '14:00', client: 'M. Bernard', vehicle: 'Citroën C3', service: 'Freins' },
    { time: '16:30', client: 'Mme Rousseau', vehicle: 'Volkswagen Golf', service: 'Pneumatiques' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Planning d'aujourd'hui</span>
          </span>
          <Badge variant="secondary">{todayAppointments.length} RDV</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayAppointments.map((appointment, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{appointment.client}</p>
                <p className="text-xs text-muted-foreground">{appointment.vehicle} • {appointment.service}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-medium">{appointment.time}</p>
            </div>
          </div>
        ))}
        <Button variant="ghost" className="w-full mt-4 hover:bg-primary/5">
          Voir tout le planning
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

const Index = () => {
  const { user } = useApp();
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    console.log('Plan sélectionné:', planId);
    setIsPricingOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête avec bouton de test */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user?.email || 'Utilisateur'}
          </p>
        </div>

        {/* Bouton de test PricingModal */}
        <Button
          onClick={() => setIsPricingOpen(true)}
          className="bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#075E54] hover:to-[#128C7E] text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <Crown className="w-4 h-4 mr-2" />
          Tester PricingModal WhatsApp
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <TodaySchedule />
      </div>

      {/* PricingModal pour test */}
      <PricingModal
        isOpen={isPricingOpen}
        onSelectPlan={handlePlanSelect}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
};

export default Index;

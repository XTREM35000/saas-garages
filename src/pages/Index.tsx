import React from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  TrendingUp 
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
  const { theme, currentUser } = useApp();
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenue, {currentUser?.name || 'Admin'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant="outline" 
            className={`px-3 py-1 ${
              theme === 'icloud' 
                ? 'border-blue-200 text-blue-600 bg-blue-50' 
                : 'border-green-200 text-green-600 bg-green-50'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
            Thème {theme === 'icloud' ? 'iCloud' : 'WhatsApp'}
          </Badge>
          <Button size="sm" className="shadow-sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Voir Rapports
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Quick Actions & Today Schedule */}
      <div className="grid gap-6 lg:grid-cols-3">
        <QuickActions />
        <div className="lg:col-span-2">
          <TodaySchedule />
        </div>
      </div>

      {/* Bottom CTA */}
      <Card className="bg-gradient-primary text-primary-foreground border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold">Optimisez votre garage</h3>
              <p className="text-primary-foreground/80 text-sm">
                Découvrez toutes les fonctionnalités pour améliorer votre productivité
              </p>
            </div>
            <Button variant="secondary" className="shadow-lg">
              Explorer les modules
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;

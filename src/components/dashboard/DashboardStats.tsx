import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Users, Wrench, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'primary' }) => (
  <Card className="hover:shadow-card transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-lg bg-${color}/10`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className="text-xs text-muted-foreground mt-1">
          {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

interface RecentActivityItem {
  id: string;
  type: 'repair' | 'appointment' | 'invoice';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

const ActivityItem: React.FC<{ activity: RecentActivityItem }> = ({ activity }) => {
  const statusColors = {
    success: 'bg-toast-success',
    warning: 'bg-yellow-500',
    error: 'bg-toast-error',
  };

  const statusIcons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle,
  };

  const Icon = statusIcons[activity.status];

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`p-2 rounded-full ${statusColors[activity.status]}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
      </div>
      <div className="text-xs text-muted-foreground">
        {activity.time}
      </div>
    </div>
  );
};

export const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Véhicules en cours',
      value: 12,
      icon: <Car className="h-4 w-4 text-primary" />,
      trend: '+2 depuis hier',
    },
    {
      title: 'Clients actifs',
      value: 247,
      icon: <Users className="h-4 w-4 text-primary" />,
      trend: '+15 ce mois',
    },
    {
      title: 'Réparations terminées',
      value: 89,
      icon: <Wrench className="h-4 w-4 text-primary" />,
      trend: 'Ce mois',
    },
    {
      title: 'Chiffre d\'affaires',
      value: '€25,430',
      icon: <CreditCard className="h-4 w-4 text-primary" />,
      trend: '+8% vs mois dernier',
    },
  ];

  const recentActivities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'repair',
      title: 'Réparation terminée',
      description: 'Renault Clio - Changement plaquettes de frein',
      time: 'Il y a 2h',
      status: 'success',
    },
    {
      id: '2',
      type: 'appointment',
      title: 'Nouveau rendez-vous',
      description: 'Peugeot 308 - Vidange prévue demain 14h',
      time: 'Il y a 3h',
      status: 'warning',
    },
    {
      id: '3',
      type: 'invoice',
      title: 'Facture payée',
      description: 'Client Martin - €320 reçus',
      time: 'Il y a 5h',
      status: 'success',
    },
  ];

  const alerts = [
    { message: 'Stock faible: Plaquettes de frein (2 restantes)', type: 'warning' },
    { message: '3 véhicules en attente de pièces', type: 'error' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                  alert.type === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
            <div className="pt-4">
              <Badge variant="outline" className="w-full justify-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Système opérationnel
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
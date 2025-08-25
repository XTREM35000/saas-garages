import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  Settings,
  Database,
  Server,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MaintenanceLog: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  const maintenanceLogs = [
    {
      id: '1',
      tenant: 'Garage Auto Plus',
      type: 'Sécurité',
      description: 'Mise à jour des certificats SSL et renforcement de la sécurité',
      technician: 'Admin Système',
      status: 'completed',
      startDate: '2024-12-20 10:00',
      endDate: '2024-12-20 11:30',
      duration: '1h 30min',
      impact: 'low',
      priority: 'medium'
    },
    {
      id: '2',
      tenant: 'Garage Excellence',
      type: 'Base de données',
      description: 'Optimisation des requêtes et nettoyage des données obsolètes',
      technician: 'Admin Système',
      status: 'completed',
      startDate: '2024-12-19 14:00',
      endDate: '2024-12-19 16:00',
      duration: '2h',
      impact: 'medium',
      priority: 'high'
    },
    {
      id: '3',
      tenant: 'Garage Central',
      type: 'Serveur',
      description: 'Mise à jour du système et installation des derniers correctifs',
      technician: 'Admin Système',
      status: 'in_progress',
      startDate: '2024-12-20 09:00',
      endDate: null,
      duration: 'En cours',
      impact: 'high',
      priority: 'high'
    },
    {
      id: '4',
      tenant: 'Tous les tenants',
      type: 'Application',
      description: 'Déploiement de la nouvelle version avec corrections de bugs',
      technician: 'Admin Système',
      status: 'scheduled',
      startDate: '2024-12-22 02:00',
      endDate: null,
      duration: 'Prévu',
      impact: 'medium',
      priority: 'medium'
    },
    {
      id: '5',
      tenant: 'Garage Test',
      type: 'Support',
      description: 'Résolution d\'un problème de connexion utilisateur',
      technician: 'Support Technique',
      status: 'completed',
      startDate: '2024-12-18 15:30',
      endDate: '2024-12-18 16:15',
      duration: '45min',
      impact: 'low',
      priority: 'low'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Prévu</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Faible</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Élevé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Basse</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Moyenne</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Haute</Badge>;
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Sécurité':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'Base de données':
        return <Database className="w-4 h-4 text-green-600" />;
      case 'Serveur':
        return <Server className="w-4 h-4 text-purple-600" />;
      case 'Application':
        return <Settings className="w-4 h-4 text-orange-600" />;
      case 'Support':
        return <User className="w-4 h-4 text-gray-600" />;
      default:
        return <Wrench className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredLogs = maintenanceLogs.filter(log => 
    filterStatus === 'all' || log.status === filterStatus
  );

  const stats = [
    { label: 'Total Interventions', value: maintenanceLogs.length, icon: Wrench, color: 'text-blue-600' },
    { label: 'Terminées', value: maintenanceLogs.filter(l => l.status === 'completed').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'En cours', value: maintenanceLogs.filter(l => l.status === 'in_progress').length, icon: Clock, color: 'text-blue-600' },
    { label: 'Prévues', value: maintenanceLogs.filter(l => l.status === 'scheduled').length, icon: Calendar, color: 'text-yellow-600' }
  ];

  const handleAddMaintenance = () => {
    toast.info('Fonctionnalité d\'ajout de maintenance à implémenter');
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Log de maintenance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-slate-600" />
              Journal de Maintenance
            </CardTitle>
            <Button onClick={handleAddMaintenance} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle Intervention
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              Toutes
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('completed')}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Terminées
            </Button>
            <Button
              variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('in_progress')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              En cours
            </Button>
            <Button
              variant={filterStatus === 'scheduled' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('scheduled')}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Prévues
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Priorité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-slate-50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{log.tenant}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(log.type)}
                        <span>{log.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-xs truncate">{log.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{log.technician}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{log.startDate}</span>
                        </div>
                        {log.endDate && (
                          <div className="text-xs text-slate-500">
                            Fin: {log.endDate}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-sm">{log.duration}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getImpactBadge(log.impact)}</TableCell>
                    <TableCell>{getPriorityBadge(log.priority)}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceLog;

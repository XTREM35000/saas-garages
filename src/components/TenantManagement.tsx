import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  Users,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const TenantManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const tenants = [
    {
      id: '1',
      name: 'Garage Auto Plus',
      admin: 'Jean Dupont',
      email: 'contact@garageautoplus.fr',
      plan: 'Mensuel',
      status: 'active',
      lastPayment: '2024-12-15',
      nextPayment: '2025-01-15',
      amount: '25 000 FCFA',
      users: 8,
      garages: 2,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Garage Excellence',
      admin: 'Marie Martin',
      email: 'admin@garageexcellence.fr',
      plan: 'Annuel',
      status: 'active',
      lastPayment: '2024-11-20',
      nextPayment: '2025-11-20',
      amount: '250 000 FCFA',
      users: 15,
      garages: 5,
      createdAt: '2023-06-10'
    },
    {
      id: '3',
      name: 'Garage Central',
      admin: 'Pierre Durand',
      email: 'info@garagecentral.fr',
      plan: 'Mensuel',
      status: 'suspended',
      lastPayment: '2024-11-15',
      nextPayment: '2024-12-15',
      amount: '25 000 FCFA',
      users: 6,
      garages: 1,
      createdAt: '2024-03-20'
    },
    {
      id: '4',
      name: 'Garage Test',
      admin: 'Sophie Bernard',
      email: 'test@garagetest.fr',
      plan: 'Gratuit',
      status: 'expired',
      lastPayment: '2024-10-01',
      nextPayment: '2024-10-08',
      amount: '0 FCFA',
      users: 3,
      garages: 1,
      createdAt: '2024-09-25'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspendu</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'Mensuel':
        return <Badge className="bg-blue-100 text-blue-800">Mensuel</Badge>;
      case 'Annuel':
        return <Badge className="bg-purple-100 text-purple-800">Annuel</Badge>;
      case 'Gratuit':
        return <Badge className="bg-gray-100 text-gray-800">Gratuit</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const handleSuspendTenant = (tenantId: string) => {
    toast.success(`Tenant ${tenantId} suspendu avec succès`);
  };

  const handleActivateTenant = (tenantId: string) => {
    toast.success(`Tenant ${tenantId} activé avec succès`);
  };

  const handleDeleteTenant = (tenantId: string) => {
    toast.success(`Tenant ${tenantId} supprimé avec succès`);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tenant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Tenants', value: tenants.length, icon: Building, color: 'text-blue-600' },
    { label: 'Actifs', value: tenants.filter(t => t.status === 'active').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Suspendus', value: tenants.filter(t => t.status === 'suspended').length, icon: AlertTriangle, color: 'text-yellow-600' },
    { label: 'Expirés', value: tenants.filter(t => t.status === 'expired').length, icon: Clock, color: 'text-red-600' }
  ];

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

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            Gestion des Tenants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un tenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Tous
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Actifs
              </Button>
              <Button
                variant={filterStatus === 'suspended' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('suspended')}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Suspendus
              </Button>
              <Button
                variant={filterStatus === 'expired' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('expired')}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Expirés
              </Button>
            </div>
          </div>

          {/* Tableau des tenants */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernier Paiement</TableHead>
                  <TableHead>Prochain Paiement</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant, index) => (
                  <motion.tr
                    key={tenant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-slate-50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{tenant.name}</p>
                        <p className="text-sm text-slate-500">{tenant.admin}</p>
                        <p className="text-xs text-slate-400">{tenant.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-sm">{tenant.lastPayment}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-sm">{tenant.nextPayment}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        <span className="font-medium">{tenant.amount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{tenant.users}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Voir les détails de ${tenant.name}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Modifier ${tenant.name}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {tenant.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspendTenant(tenant.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <PowerOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivateTenant(tenant.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
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

export default TenantManagement;

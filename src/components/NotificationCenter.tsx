import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Bell,
  MessageSquare,
  Send,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Mail,
  Smartphone,
  Globe,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const NotificationCenter: React.FC = () => {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'notification' | 'sms' | 'email'>('notification');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const tenants = [
    { id: '1', name: 'Garage Auto Plus', email: 'contact@garageautoplus.fr', phone: '+33 1 23 45 67 89' },
    { id: '2', name: 'Garage Excellence', email: 'admin@garageexcellence.fr', phone: '+33 1 98 76 54 32' },
    { id: '3', name: 'Garage Central', email: 'info@garagecentral.fr', phone: '+33 1 45 67 89 01' },
    { id: '4', name: 'Garage Test', email: 'test@garagetest.fr', phone: '+33 1 12 34 56 78' }
  ];

  const notifications = [
    {
      id: '1',
      type: 'notification',
      title: 'Maintenance planifiée',
      content: 'Une maintenance système est prévue le 22 décembre à 2h du matin.',
      recipients: ['Tous les tenants'],
      sentAt: '2024-12-20 14:30',
      status: 'sent',
      readCount: 24
    },
    {
      id: '2',
      type: 'sms',
      title: 'Rappel de paiement',
      content: 'Votre abonnement expire dans 3 jours. Merci de procéder au renouvellement.',
      recipients: ['Garage Central'],
      sentAt: '2024-12-19 10:15',
      status: 'sent',
      readCount: 1
    },
    {
      id: '3',
      type: 'email',
      title: 'Nouvelle fonctionnalité',
      content: 'Découvrez notre nouvelle fonctionnalité de gestion des stocks !',
      recipients: ['Tous les tenants'],
      sentAt: '2024-12-18 16:45',
      status: 'sent',
      readCount: 18
    },
    {
      id: '4',
      type: 'notification',
      title: 'Mise à jour sécurité',
      content: 'Une mise à jour de sécurité a été déployée automatiquement.',
      recipients: ['Tous les tenants'],
      sentAt: '2024-12-17 09:20',
      status: 'sent',
      readCount: 22
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notification':
        return <Bell className="w-4 h-4 text-blue-600" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-green-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Envoyé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleSendMessage = () => {
    if (!messageTitle || !messageContent) {
      toast.error('Veuillez remplir le titre et le contenu du message');
      return;
    }

    if (selectedTenants.length === 0) {
      toast.error('Veuillez sélectionner au moins un destinataire');
      return;
    }

    toast.success(`Message ${messageType} envoyé avec succès !`);
    setMessageTitle('');
    setMessageContent('');
    setSelectedTenants([]);
  };

  const handleSelectAllTenants = () => {
    if (selectedTenants.length === tenants.length) {
      setSelectedTenants([]);
    } else {
      setSelectedTenants(tenants.map(t => t.id));
    }
  };

  const handleSelectTenant = (tenantId: string) => {
    if (selectedTenants.includes(tenantId)) {
      setSelectedTenants(selectedTenants.filter(id => id !== tenantId));
    } else {
      setSelectedTenants([...selectedTenants, tenantId]);
    }
  };

  const stats = [
    { label: 'Total Messages', value: notifications.length, icon: MessageSquare, color: 'text-blue-600' },
    { label: 'Notifications', value: notifications.filter(n => n.type === 'notification').length, icon: Bell, color: 'text-blue-600' },
    { label: 'SMS', value: notifications.filter(n => n.type === 'sms').length, icon: Smartphone, color: 'text-green-600' },
    { label: 'Emails', value: notifications.filter(n => n.type === 'email').length, icon: Mail, color: 'text-purple-600' }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Envoi de message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-slate-600" />
              Envoyer un Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type de message */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Type de message</label>
              <div className="flex gap-2">
            <Button
                  variant={messageType === 'notification' ? 'default' : 'outline'}
                  onClick={() => setMessageType('notification')}
              size="sm"
                  className="flex items-center gap-2"
            >
                  <Bell className="w-4 h-4" />
                  Notification
            </Button>
            <Button
                  variant={messageType === 'sms' ? 'default' : 'outline'}
                  onClick={() => setMessageType('sms')}
              size="sm"
                  className="flex items-center gap-2"
            >
                  <Smartphone className="w-4 h-4" />
                  SMS
            </Button>
            <Button
                  variant={messageType === 'email' ? 'default' : 'outline'}
                  onClick={() => setMessageType('email')}
              size="sm"
                  className="flex items-center gap-2"
            >
                  <Mail className="w-4 h-4" />
                  Email
            </Button>
          </div>
            </div>

            {/* Destinataires */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Destinataires</label>
              <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
          <Button
                    variant="outline"
            size="sm"
                    onClick={handleSelectAllTenants}
                    className="flex items-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    {selectedTenants.length === tenants.length ? 'Désélectionner tout' : 'Sélectionner tout'}
          </Button>
        </div>
                <div className="space-y-2">
                  {tenants.map(tenant => (
                    <div key={tenant.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTenants.includes(tenant.id)}
                        onChange={() => handleSelectTenant(tenant.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{tenant.name}</span>
              </div>
                  ))}
                    </div>
                        </div>
                      </div>

            {/* Titre */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Titre</label>
              <Input
                placeholder="Titre du message..."
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
              />
            </div>

            {/* Contenu */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Contenu</label>
              <Textarea
                placeholder="Contenu du message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
                        </div>

                        <Button
              onClick={handleSendMessage}
              className="w-full flex items-center gap-2"
              disabled={!messageTitle || !messageContent || selectedTenants.length === 0}
            >
              <Send className="w-4 h-4" />
              Envoyer le Message
                        </Button>
          </CardContent>
        </Card>

        {/* Historique des messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              Historique des Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border rounded-lg p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{notification.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{notification.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Destinataires: {notification.recipients.join(', ')}</span>
                          <span>Lu: {notification.readCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(notification.status)}
                      <div className="text-xs text-slate-500 mt-1">
                        {notification.sentAt}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
                </div>
          </div>
  );
};

export default NotificationCenter;

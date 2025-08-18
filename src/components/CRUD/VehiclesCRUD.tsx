import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Car } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year?: number;
  license_plate?: string;
  vin?: string;
  customer_id?: string;
  organisation_id?: string;
  created_at: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

export const VehiclesCRUD: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    customer_id: ''
  });

  // Charger les véhicules
  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Erreur chargement véhicules:', error);
      toast.error('Erreur lors du chargement des véhicules');
    }
  };

  // Charger les clients
  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, full_name')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Créer/Modifier un véhicule
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.make.trim() || !formData.model.trim()) {
      toast.error('La marque et le modèle sont requis');
      return;
    }

    try {
      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : null,
        license_plate: formData.license_plate || null,
        vin: formData.vin || null,
        customer_id: formData.customer_id || null
      };

      if (editingVehicle) {
        // Modification
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id);

        if (error) throw error;
        toast.success('Véhicule modifié avec succès');
      } else {
        // Création
        const { error } = await supabase
          .from('vehicles')
          .insert(vehicleData);

        if (error) throw error;
        toast.success('Véhicule créé avec succès');
      }

      setIsModalOpen(false);
      resetForm();
      loadVehicles();
    } catch (error: any) {
      console.error('Erreur sauvegarde véhicule:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer un véhicule
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Véhicule supprimé avec succès');
      loadVehicles();
    } catch (error: any) {
      console.error('Erreur suppression véhicule:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: '',
      license_plate: '',
      vin: '',
      customer_id: ''
    });
    setEditingVehicle(null);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year?.toString() || '',
      license_plate: vehicle.license_plate || '',
      vin: vehicle.vin || '',
      customer_id: vehicle.customer_id || ''
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '-';
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.first_name} ${customer.last_name}` : 'Client inconnu';
  };

  useEffect(() => {
    loadVehicles();
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Gestion des Véhicules
            </CardTitle>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Véhicule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Marque *</Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                        placeholder="Peugeot, Renault..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Modèle *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="208, Clio..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Année</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_plate">Plaque d'immatriculation</Label>
                      <Input
                        id="license_plate"
                        value={formData.license_plate}
                        onChange={(e) => setFormData(prev => ({ ...prev, license_plate: e.target.value.toUpperCase() }))}
                        placeholder="AB-123-CD"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vin">Numéro de châssis (VIN)</Label>
                    <Input
                      id="vin"
                      value={formData.vin}
                      onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                      placeholder="VF1XXXXXX..."
                      maxLength={17}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_id">Client propriétaire</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun client</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingVehicle ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Chargement des véhicules...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marque</TableHead>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead>Immatriculation</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun véhicule trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.make}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.year || '-'}</TableCell>
                      <TableCell>{vehicle.license_plate || '-'}</TableCell>
                      <TableCell>{getCustomerName(vehicle.customer_id)}</TableCell>
                      <TableCell>
                        {new Date(vehicle.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(vehicle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
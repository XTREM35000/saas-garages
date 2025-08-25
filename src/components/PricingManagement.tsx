import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Save, RotateCcw, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePricing } from '@/hooks/usePricing';

const PricingManagement: React.FC = () => {
  const { pricing, loading, error, updatePricing, refreshPricing } = usePricing();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    monthly: '25000',
    yearly: '250000'
  });

  // Mettre à jour le formulaire quand les prix changent
  useEffect(() => {
    if (pricing) {
      setFormData({
        monthly: pricing.pricing_month.toString(),
        yearly: pricing.pricing_year.toString()
      });
    }
  }, [pricing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const monthly = parseFloat(formData.monthly);
    const yearly = parseFloat(formData.yearly);

    if (isNaN(monthly) || isNaN(yearly)) {
      toast.error('Veuillez entrer des valeurs numériques valides');
      return;
    }

    if (monthly <= 0 || yearly <= 0) {
      toast.error('Les prix doivent être supérieurs à 0');
      return;
    }

    setIsUpdating(true);
    
    try {
      const success = await updatePricing(monthly, yearly);
      
      if (success) {
        toast.success('Prix mis à jour avec succès !');
        await refreshPricing();
      } else {
        toast.error('Erreur lors de la mise à jour des prix');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des prix');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    setIsUpdating(true);
    
    try {
      const success = await updatePricing(25000, 250000);
      
      if (success) {
        toast.success('Prix remis aux valeurs par défaut !');
        await refreshPricing();
      } else {
        toast.error('Erreur lors de la réinitialisation');
      }
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Chargement des prix...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span>Gestion des Prix</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="monthly">Prix Mensuel (FCFA)</Label>
                <Input
                  id="monthly"
                  type="number"
                  value={formData.monthly}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly: e.target.value }))}
                  placeholder="25000"
                  min="0"
                  step="100"
                  className="text-lg font-mono"
                />
                <p className="text-sm text-gray-500">
                  Prix pour l'abonnement mensuel
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearly">Prix Annuel (FCFA)</Label>
                <Input
                  id="yearly"
                  type="number"
                  value={formData.yearly}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearly: e.target.value }))}
                  placeholder="250000"
                  min="0"
                  step="1000"
                  className="text-lg font-mono"
                />
                <p className="text-sm text-gray-500">
                  Prix pour l'abonnement annuel
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900">
                    Informations importantes
                  </p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• <strong>Prix mensuel</strong> : Affiché dans le plan "Mensuel"</p>
                    <p>• <strong>Prix annuel</strong> : Affiché dans le plan "Annuel"</p>
                    <p>• <strong>Mise à jour immédiate</strong> : Les changements s'appliquent instantanément</p>
                    <p>• <strong>Valeurs par défaut</strong> : 25 000 FCFA/mois et 250 000 FCFA/an</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isUpdating}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Remettre aux valeurs par défaut
                  </>
                )}
              </Button>

              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Mettre à jour les prix
                  </>
                )}
              </Button>
            </div>
          </form>

          {pricing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Prix actuels :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mensuel :</span>
                  <span className="font-mono font-semibold text-green-600">
                    {pricing.pricing_month.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Annuel :</span>
                  <span className="font-mono font-semibold text-blue-600">
                    {pricing.pricing_year.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques des prix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Plan Mensuel</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pricing ? pricing.pricing_month.toLocaleString() : '25 000'} FCFA
                </p>
                <p className="text-sm text-green-600">+15% d'utilisation</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Plan Annuel</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pricing ? pricing.pricing_year.toLocaleString() : '250 000'} FCFA
                </p>
                <p className="text-sm text-blue-600">+8% d'utilisation</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Économie Annuelle</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pricing ? ((pricing.pricing_month * 12) - pricing.pricing_year).toLocaleString() : '50 000'} FCFA
                </p>
                <p className="text-sm text-purple-600">Économie réalisée</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingManagement;

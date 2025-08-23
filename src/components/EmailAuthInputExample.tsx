import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailAuthInput } from '@/components/ui/email-auth-input';
import { Button } from '@/components/ui/button';

export const EmailAuthInputExample: React.FC = () => {
  const [email1, setEmail1] = useState('');
  const [email2, setEmail2] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('garage-titoh');

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#128C7E] mb-6">
        Exemple d'utilisation EmailAuthInput
      </h2>

      {/* Exemple 1: Avec slug */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#128C7E]">
            Exemple avec slug: {selectedSlug}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              variant={selectedSlug === 'garage-titoh' ? 'default' : 'outline'}
              onClick={() => setSelectedSlug('garage-titoh')}
              size="sm"
            >
              garage-titoh
            </Button>
            <Button
              variant={selectedSlug === 'garage-martin' ? 'default' : 'outline'}
              onClick={() => setSelectedSlug('garage-martin')}
              size="sm"
            >
              garage-martin
            </Button>
            <Button
              variant={selectedSlug === 'garage-dubois' ? 'default' : 'outline'}
              onClick={() => setSelectedSlug('garage-dubois')}
              size="sm"
            >
              garage-dubois
            </Button>
          </div>

          <EmailAuthInput
            slug={selectedSlug}
            value={email1}
            onChange={setEmail1}
            label="Email professionnel"
            placeholder="prenom.nom"
          />

          <div className="text-sm text-gray-600">
            <strong>Email complet généré:</strong> {email1 || 'Aucun'}
          </div>
        </CardContent>
      </Card>

      {/* Exemple 2: Sans slug */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#128C7E]">
            Exemple sans slug (email libre)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmailAuthInput
            value={email2}
            onChange={setEmail2}
            label="Email personnel"
            placeholder="votre@email.com"
          />

          <div className="text-sm text-gray-600">
            <strong>Email saisi:</strong> {email2 || 'Aucun'}
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-gray-700">Résumé des fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ <strong>Avec slug:</strong> L'utilisateur saisit seulement la partie locale (prenom.nom)</li>
            <li>✅ <strong>Badge automatique:</strong> Affichage du domaine @slug.com à droite</li>
            <li>✅ <strong>Sans slug:</strong> Email libre avec validation standard</li>
            <li>✅ <strong>Validation:</strong> Format email automatique</li>
            <li>✅ <strong>Design:</strong> Style shadcn/ui cohérent</li>
            <li>✅ <strong>Accessibilité:</strong> Labels, erreurs et ARIA</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAuthInputExample;

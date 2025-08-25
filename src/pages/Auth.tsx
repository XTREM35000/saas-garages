

import React from 'react';
import { EnhancedAuthForm } from '@/components/Auth/EnhancedAuthForm';
import SimpleAuthGuard from '@/components/SimpleAuthGuard';

const Auth: React.FC = () => {
  return (
    <SimpleAuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <EnhancedAuthForm
          onSuccess={(userData) => {
            console.log('✅ Authentification réussie:', userData);
            // La redirection sera gérée par le AuthGuard
          }}
        />
      </div>
    </SimpleAuthGuard>
  );
};

export default Auth;

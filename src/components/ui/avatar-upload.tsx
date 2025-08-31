import React, { useState } from 'react';
import AnimatedLogo from '@/components/AnimatedLogo';

interface AvatarUploadProps {
  avatarPreview: string | null;
  onAvatarChange: (file: File) => void;
  role: 'Super Admin' | 'Administrateur' | 'Organisation';
  roleColor: 'gold' | 'silver' | 'bronze';
  title: string;
  subtitle?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarPreview,
  onAvatarChange,
  role,
  roleColor,
  title,
  subtitle
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onAvatarChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const getRoleColorClasses = () => {
    switch (roleColor) {
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver':
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'bronze':
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  return (
    <div className="text-center space-y-4">
      {/* Header avec logo animé et badge de rôle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <AnimatedLogo size={32} />
          <div className="text-left">
            <h2 className="text-2xl font-bold text-[#128C7E]">{title}</h2>
            {subtitle && (
              <div>
                <p className="text-sm text-gray-600">{subtitle}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span 
                    className="text-xl cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                      // Simuler des données invalides
                      const event = new CustomEvent('fillFormError', { 
                        detail: { role: role.toLowerCase().replace(' ', '_') } 
                      });
                      window.dispatchEvent(event);
                    }}
                  >😠</span>
                  <span 
                    className="text-xl cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                      // Simuler des données valides
                      const event = new CustomEvent('fillFormSuccess', { 
                        detail: { role: role.toLowerCase().replace(' ', '_') } 
                      });
                      window.dispatchEvent(event);
                    }}
                  >😊</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Badge de rôle */}
        <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getRoleColorClasses()}`}>
          {role}
        </div>
      </div>

      {/* Zone d'upload d'avatar simplifiée - seulement l'image cliquable */}
      <div className="flex justify-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          id="avatar-upload"
        />
        
        {avatarPreview ? (
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#128C7E]/20 shadow-lg cursor-pointer hover:border-[#128C7E]/40 transition-all duration-200" onClick={() => document.getElementById('avatar-upload')?.click()}>
            <img 
              src={avatarPreview} 
              alt="Aperçu avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <label
            htmlFor="avatar-upload"
            className={`w-40 h-40 rounded-full border-4 border-dashed border-[#128C7E]/30 flex items-center justify-center bg-gradient-to-br from-[#128C7E]/5 to-[#25D366]/5 hover:from-[#128C7E]/10 hover:to-[#25D366]/10 transition-all duration-200 cursor-pointer ${
              isDragging ? 'border-[#128C7E] bg-[#128C7E]/20' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Image par défaut moderne */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-[#128C7E]/70 font-medium">
                Cliquez pour ajouter une photo
              </p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;

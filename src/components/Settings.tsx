import React, { useState, useEffect, useRef } from 'react';
import { User, Save, CheckCircle, Upload } from 'lucide-react';

interface SettingsProps {
  currentName: string;
  currentAvatar: string;
  onProfileUpdate: (name: string, avatar: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentName, currentAvatar, onProfileUpdate }) => {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentName);
    setAvatar(currentAvatar);
  }, [currentName, currentAvatar]);

  const handleSave = () => {
    onProfileUpdate(name, avatar);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Oculta a mensagem após 3 segundos
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-8 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Configurações do Perfil</h2>
      <p className="text-sm text-slate-500 mb-8">Atualize seu nome e foto de perfil.</p>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
              <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={triggerFileSelect}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Alterar foto"
            >
              <Upload size={24} />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">Sua Foto</h3>
            <p className="text-xs text-slate-500 mb-3">Clique na imagem para carregar uma nova.</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
            />
            <button
              onClick={triggerFileSelect}
              className="text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg"
            >
              Selecionar Arquivo
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome de Exibição</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full pl-9 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Save size={18} />
          Salvar Alterações
        </button>
        
        {isSaved && (
          <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Perfil atualizado com sucesso!</span>
          </div>
        )}
      </div>
    </div>
  );
};
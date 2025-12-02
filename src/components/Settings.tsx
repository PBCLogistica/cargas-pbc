import React, { useState, useEffect } from 'react';
import { User, Image, Save, CheckCircle } from 'lucide-react';

interface SettingsProps {
  currentName: string;
  currentAvatar: string;
  onProfileUpdate: (name: string, avatar: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentName, currentAvatar, onProfileUpdate }) => {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setName(currentName);
    setAvatar(currentAvatar);
  }, [currentName, currentAvatar]);

  const handleSave = () => {
    onProfileUpdate(name, avatar);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Oculta a mensagem após 3 segundos
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-8 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Configurações do Perfil</h2>
      <p className="text-sm text-slate-500 mb-8">Atualize seu nome e foto de perfil.</p>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
            <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <label htmlFor="avatar" className="block text-sm font-medium text-slate-700 mb-1">URL da Foto de Perfil</label>
            <div className="relative">
              <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="avatar"
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://exemplo.com/sua-foto.jpg"
                className="w-full pl-9 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
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
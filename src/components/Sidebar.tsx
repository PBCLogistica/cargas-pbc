import React from 'react';
import { LayoutDashboard, Truck, Bot, Settings, LogOut, Box, Users, MapPin, Calculator, Building2, Timer } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, handleLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'loads', label: 'Gerenciar Cargas', icon: Truck },
    { id: 'clients', label: 'Clientes', icon: Building2 },
    { id: 'fleet', label: 'Frota e Motoristas', icon: Users },
    { id: 'daily_rates', label: 'Controle de Diárias', icon: Timer },
    { id: 'tracking', label: 'Rastreamento', icon: MapPin },
    { id: 'calculator', label: 'Calculadora Frete', icon: Calculator },
    { id: 'assistant', label: 'Assistente IA', icon: Bot },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full shadow-xl
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Box size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cargas PBC</h1>
            <p className="text-xs text-slate-400">Logística Inteligente</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id as ViewState);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
          <div className="mt-4 px-4 text-xs text-slate-600">
            v1.0.0 • © 2024 PBC
          </div>
        </div>
      </aside>
    </>
  );
};
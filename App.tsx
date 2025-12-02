import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LoadList } from './components/LoadList';
import { FleetList } from './components/FleetList';
import { ClientList } from './components/ClientList';
import { DailyRatesList } from './components/DailyRatesList';
import { TrackingView } from './components/TrackingView';
import { FreightCalculator } from './components/FreightCalculator';
import { AIAssistant } from './components/AIAssistant';
import { MOCK_LOADS, MOCK_FLEET, MOCK_CLIENTS, MOCK_DAILY_RATES } from './constants';
import { ViewState, FleetRecord, Client, DailyRateRecord } from './types';
import { Menu, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Lifted state
  const [fleetRecords, setFleetRecords] = useState<FleetRecord[]>(MOCK_FLEET);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [dailyRates, setDailyRates] = useState<DailyRateRecord[]>(MOCK_DAILY_RATES);

  const handleAddFleetRecord = (newRecord: FleetRecord) => {
    setFleetRecords([...fleetRecords, newRecord]);
  };

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, newClient]);
  };

  const handleAddDailyRate = (newRecord: DailyRateRecord) => {
    setDailyRates([...dailyRates, newRecord]);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard loads={MOCK_LOADS} fleet={fleetRecords} />;
      case 'loads':
        return <LoadList loads={MOCK_LOADS} fleet={fleetRecords} />;
      case 'fleet':
        return <FleetList records={fleetRecords} onAddRecord={handleAddFleetRecord} />;
      case 'clients':
        return <ClientList clients={clients} onAddClient={handleAddClient} />;
      case 'daily_rates':
        return <DailyRatesList records={dailyRates} fleet={fleetRecords} clients={clients} onAddRecord={handleAddDailyRate} />;
      case 'tracking':
        return <TrackingView loads={MOCK_LOADS} />;
      case 'calculator':
        return <FreightCalculator />;
      case 'assistant':
        return <AIAssistant loads={MOCK_LOADS} />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Configurações</h2>
                <p>Funcionalidade em desenvolvimento.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard loads={MOCK_LOADS} fleet={fleetRecords} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {currentView === 'dashboard' && 'Visão Geral'}
              {currentView === 'loads' && 'Minhas Cargas'}
              {currentView === 'fleet' && 'Gestão de Frota'}
              {currentView === 'clients' && 'Base de Clientes'}
              {currentView === 'daily_rates' && 'Controle de Diárias'}
              {currentView === 'tracking' && 'Rastreamento em Tempo Real'}
              {currentView === 'calculator' && 'Calculadora de Frete (ANTT)'}
              {currentView === 'assistant' && 'Inteligência Artificial'}
              {currentView === 'settings' && 'Preferências'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Notification Bell Demo */}
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Admin Usuário</p>
                <p className="text-xs text-slate-500">Gerente de Logística</p>
              </div>
              <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                 <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto h-full">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
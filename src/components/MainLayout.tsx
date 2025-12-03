import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { LoadList } from './LoadList';
import { FleetList } from './FleetList';
import { ClientList } from './ClientList';
import { DailyRatesList } from './DailyRatesList';
import { TrackingView } from './TrackingView';
import { FreightCalculator } from './FreightCalculator';
import { AIAssistant } from './AIAssistant';
import { Settings } from './Settings';
import { ProjectList } from './ProjectList';
import { MOCK_LOADS, MOCK_FLEET, MOCK_CLIENTS, MOCK_DAILY_RATES, MOCK_PROJECTS } from '../constants';
import { ViewState, FleetRecord, Client, DailyRateRecord, Load, Project } from '../types';
import { Menu, Bell, Save, CheckCircle } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';

interface MainLayoutProps {
  supabase: SupabaseClient;
}

const MainLayout: React.FC<MainLayoutProps> = ({ supabase }) => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // User Profile State
  const [userName, setUserName] = useState('Admin Usuário');
  const [userAvatar, setUserAvatar] = useState('https://picsum.photos/100/100');

  // Lifted state for app data
  const [loads, setLoads] = useState<Load[]>(MOCK_LOADS);
  const [fleetRecords, setFleetRecords] = useState<FleetRecord[]>(MOCK_FLEET);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [dailyRates, setDailyRates] = useState<DailyRateRecord[]>(MOCK_DAILY_RATES);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedLoads = localStorage.getItem('cargas_pbc_loads');
      if (savedLoads) setLoads(JSON.parse(savedLoads));

      const savedFleet = localStorage.getItem('cargas_pbc_fleet');
      if (savedFleet) setFleetRecords(JSON.parse(savedFleet));

      const savedClients = localStorage.getItem('cargas_pbc_clients');
      if (savedClients) setClients(JSON.parse(savedClients));

      const savedDailyRates = localStorage.getItem('cargas_pbc_dailyRates');
      if (savedDailyRates) setDailyRates(JSON.parse(savedDailyRates));

      const savedProjects = localStorage.getItem('cargas_pbc_projects');
      if (savedProjects) setProjects(JSON.parse(savedProjects));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const handleSaveChanges = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('cargas_pbc_loads', JSON.stringify(loads));
      localStorage.setItem('cargas_pbc_fleet', JSON.stringify(fleetRecords));
      localStorage.setItem('cargas_pbc_clients', JSON.stringify(clients));
      localStorage.setItem('cargas_pbc_dailyRates', JSON.stringify(dailyRates));
      localStorage.setItem('cargas_pbc_projects', JSON.stringify(projects));
      
      setTimeout(() => {
        setIsSaving(false);
      }, 1500);

    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      alert('Ocorreu um erro ao salvar as alterações.');
      setIsSaving(false);
    }
  };

  const handleProfileUpdate = (newName: string, newAvatar: string) => {
    setUserName(newName);
    setUserAvatar(newAvatar);
  };

  const handleAddLoad = (newLoad: Load) => {
    setLoads([newLoad, ...loads]);
  };

  const handleUpdateLoad = (updatedLoad: Load) => {
    setLoads(loads.map(load => (load.id === updatedLoad.id ? updatedLoad : load)));
  };

  const handleDeleteLoad = (id: string) => {
    setLoads(loads.filter(load => load.id !== id));
  };

  const handleAddFleetRecord = (newRecord: FleetRecord) => {
    setFleetRecords([...fleetRecords, newRecord]);
  };

  const handleUpdateFleetRecord = (updatedRecord: FleetRecord) => {
    const originalRecord = fleetRecords.find(f => f.id === updatedRecord.id);
    if (!originalRecord) return;

    setFleetRecords(fleetRecords.map(record => (record.id === updatedRecord.id ? updatedRecord : record)));

    // Propagate changes to other data sets
    setLoads(prevLoads => 
      prevLoads.map(load => {
        if (load.driver === originalRecord.driverName) {
          return {
            ...load,
            driver: updatedRecord.driverName,
            truckPlate: updatedRecord.truckPlate,
            trailerPlate: updatedRecord.trailerPlate,
            vehicleType: updatedRecord.truckType,
            weight: updatedRecord.capacity
          };
        }
        return load;
      })
    );

    setDailyRates(prevDailyRates => 
      prevDailyRates.map(rate => {
        if (rate.driverName === originalRecord.driverName) {
          return {
            ...rate,
            driverName: updatedRecord.driverName,
            truckPlate: updatedRecord.truckPlate,
            trailerPlate: updatedRecord.trailerPlate
          };
        }
        return rate;
      })
    );
  };

  const handleDeleteFleetRecord = (id: string) => {
    setFleetRecords(fleetRecords.filter(record => record.id !== id));
  };

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    const originalClient = clients.find(c => c.id === updatedClient.id);
    if (!originalClient) return;

    setClients(clients.map(client => (client.id === updatedClient.id ? updatedClient : client)));

    // Propagate name change if it occurred
    if (originalClient.companyName !== updatedClient.companyName) {
      setLoads(prevLoads => 
        prevLoads.map(load => 
          load.client === originalClient.companyName ? { ...load, client: updatedClient.companyName } : load
        )
      );
      setDailyRates(prevDailyRates => 
        prevDailyRates.map(rate => 
          rate.clientName === originalClient.companyName ? { ...rate, clientName: updatedClient.companyName } : rate
        )
      );
    }
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const handleAddDailyRate = (newRecord: DailyRateRecord) => {
    setDailyRates([...dailyRates, newRecord]);
  };

  const handleAddProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard loads={loads} fleet={fleetRecords} />;
      case 'loads':
        return <LoadList loads={loads} fleet={fleetRecords} clients={clients} onAddLoad={handleAddLoad} onUpdateLoad={handleUpdateLoad} onDeleteLoad={handleDeleteLoad} />;
      case 'projects':
        return <ProjectList projects={projects} clients={clients} onAddProject={handleAddProject} onUpdateProject={handleUpdateProject} onDeleteProject={handleDeleteProject} />;
      case 'fleet':
        return <FleetList records={fleetRecords} onAddRecord={handleAddFleetRecord} onUpdateRecord={handleUpdateFleetRecord} onDeleteRecord={handleDeleteFleetRecord} />;
      case 'clients':
        return <ClientList clients={clients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} />;
      case 'daily_rates':
        return <DailyRatesList records={dailyRates} fleet={fleetRecords} clients={clients} onAddRecord={handleAddDailyRate} />;
      case 'tracking':
        return <TrackingView loads={loads} />;
      case 'calculator':
        return <FreightCalculator />;
      case 'assistant':
        return <AIAssistant loads={loads} />;
      case 'settings':
        return <Settings currentName={userName} currentAvatar={userAvatar} onProfileUpdate={handleProfileUpdate} />;
      default:
        return <Dashboard loads={loads} fleet={fleetRecords} />;
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
        handleLogout={handleLogout}
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
              {currentView === 'projects' && 'Projetos e Contratos'}
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
             <button 
                onClick={handleSaveChanges}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm
                    ${isSaving 
                        ? 'bg-emerald-600 text-white cursor-not-allowed' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'}
                `}
             >
                {isSaving ? (
                    <>
                        <CheckCircle size={18} />
                        Salvo!
                    </>
                ) : (
                    <>
                        <Save size={18} />
                        Salvar Alterações
                    </>
                )}
             </button>

            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Gerente de Logística</p>
              </div>
              <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                 <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
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

export default MainLayout;
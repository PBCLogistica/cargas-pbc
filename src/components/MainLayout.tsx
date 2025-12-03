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
import { ViewState, FleetRecord, Client, DailyRateRecord, Load, Project, LoadStatus } from '../types';
import { Menu, Bell } from 'lucide-react';
import { SupabaseClient, User } from '@supabase/supabase-js';

interface MainLayoutProps {
  supabase: SupabaseClient;
  user: User;
}

const MainLayout: React.FC<MainLayoutProps> = ({ supabase, user }) => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [userName, setUserName] = useState('Admin Usuário');
  const [userAvatar, setUserAvatar] = useState('https://picsum.photos/100/100');

  const [loads, setLoads] = useState<Load[]>([]);
  const [fleetRecords, setFleetRecords] = useState<FleetRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dailyRates, setDailyRates] = useState<DailyRateRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const logActivity = async (action: string, entity_type: string, entity_id: string, details: object) => {
    if (!user || !user.email) return;
    await supabase.from('activity_log').insert({
      user_email: user.email,
      action,
      entity_type,
      entity_id,
      details
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const [loadsRes, fleetRes, clientsRes, dailyRatesRes, projectsRes, profileRes] = await Promise.all([
        supabase.from('loads').select('*').order('created_at', { ascending: false }),
        supabase.from('fleet').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('daily_rates').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
      ]);

      if (loadsRes.data) setLoads(loadsRes.data as Load[]);
      if (fleetRes.data) setFleetRecords(fleetRes.data as FleetRecord[]);
      if (clientsRes.data) setClients(clientsRes.data as Client[]);
      if (dailyRatesRes.data) setDailyRates(dailyRatesRes.data as DailyRateRecord[]);
      if (projectsRes.data) setProjects(projectsRes.data as Project[]);
      if (profileRes.data) {
        setUserName(profileRes.data.full_name || user.email || 'Usuário');
        setUserAvatar(profileRes.data.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`);
      }
    };

    fetchAllData();
  }, [supabase, user]);

  const handleProfileUpdate = async (newName: string, newAvatar: string) => {
    setUserName(newName);
    setUserAvatar(newAvatar);
    const { error } = await supabase.from('profiles').update({ full_name: newName, avatar_url: newAvatar, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (!error) {
      await logActivity('update', 'profile', user.id, { name: newName });
    }
  };

  // --- CRUD Handlers ---

  const handleAddLoad = async (newLoad: Omit<Load, 'id'>) => {
    const loadWithMeta = { ...newLoad, id: `PBC-${Date.now()}`, updated_by: user.email };
    const { data, error } = await supabase.from('loads').insert(loadWithMeta).select().single();
    if (data) {
      setLoads(prev => [data as Load, ...prev]);
      await logActivity('create', 'load', data.id, data);
    }
  };

  const handleUpdateLoad = async (updatedLoad: Load) => {
    const { data, error } = await supabase.from('loads').update({ ...updatedLoad, updated_by: user.email, updated_at: new Date().toISOString() }).eq('id', updatedLoad.id).select().single();
    if (data) {
      setLoads(prev => prev.map(l => l.id === data.id ? data as Load : l));
      await logActivity('update', 'load', data.id, data);
    }
  };

  const handleDeleteLoad = async (id: string) => {
    const { error } = await supabase.from('loads').delete().eq('id', id);
    if (!error) {
      setLoads(prev => prev.filter(l => l.id !== id));
      await logActivity('delete', 'load', id, { id });
    }
  };
  
  const handleUpdateLoadFromTracking = async (loadId: string, deliveryDate: string) => {
    const loadToUpdate = loads.find(l => l.id === loadId);
    if (!loadToUpdate) return;

    const updatedLoadData = { 
      ...loadToUpdate, 
      status: LoadStatus.DELIVERED, 
      deliveryDate: deliveryDate.split('T')[0]
    };
    await handleUpdateLoad(updatedLoadData);
  };

  const handleAddFleetRecord = async (newRecord: Omit<FleetRecord, 'id'>) => {
    const recordWithMeta = { ...newRecord, id: `FL-${Date.now()}`, updated_by: user.email };
    const { data } = await supabase.from('fleet').insert(recordWithMeta).select().single();
    if (data) {
      setFleetRecords(prev => [data as FleetRecord, ...prev]);
      await logActivity('create', 'fleet', data.id, data);
    }
  };

  const handleUpdateFleetRecord = async (updatedRecord: FleetRecord) => {
    const { data } = await supabase.from('fleet').update({ ...updatedRecord, updated_by: user.email, updated_at: new Date().toISOString() }).eq('id', updatedRecord.id).select().single();
    if (data) {
      setFleetRecords(prev => prev.map(r => r.id === data.id ? data as FleetRecord : r));
      await logActivity('update', 'fleet', data.id, data);
    }
  };

  const handleDeleteFleetRecord = async (id: string) => {
    const { error } = await supabase.from('fleet').delete().eq('id', id);
    if (!error) {
      setFleetRecords(prev => prev.filter(r => r.id !== id));
      await logActivity('delete', 'fleet', id, { id });
    }
  };

  const handleAddClient = async (newClient: Omit<Client, 'id'>) => {
    const clientWithMeta = { ...newClient, id: `CLI-${Date.now()}`, updated_by: user.email };
    const { data } = await supabase.from('clients').insert(clientWithMeta).select().single();
    if (data) {
      setClients(prev => [data as Client, ...prev]);
      await logActivity('create', 'client', data.id, data);
    }
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    const { data } = await supabase.from('clients').update({ ...updatedClient, updated_by: user.email, updated_at: new Date().toISOString() }).eq('id', updatedClient.id).select().single();
    if (data) {
      setClients(prev => prev.map(c => c.id === data.id ? data as Client : c));
      await logActivity('update', 'client', data.id, data);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      setClients(prev => prev.filter(c => c.id !== id));
      await logActivity('delete', 'client', id, { id });
    }
  };

  const handleAddDailyRate = async (newRecord: Omit<DailyRateRecord, 'id'>) => {
    const recordWithMeta = { ...newRecord, id: `DR-${Date.now()}`, updated_by: user.email };
    const { data } = await supabase.from('daily_rates').insert(recordWithMeta).select().single();
    if (data) {
      setDailyRates(prev => [data as DailyRateRecord, ...prev]);
      await logActivity('create', 'daily_rate', data.id, data);
    }
  };

  const handleAddProject = async (newProject: Omit<Project, 'id'>) => {
    const projectWithMeta = { ...newProject, id: `PROJ-${Date.now()}`, updated_by: user.email };
    const { data } = await supabase.from('projects').insert(projectWithMeta).select().single();
    if (data) {
      setProjects(prev => [data as Project, ...prev]);
      await logActivity('create', 'project', data.id, data);
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    const { data } = await supabase.from('projects').update({ ...updatedProject, updated_by: user.email, updated_at: new Date().toISOString() }).eq('id', updatedProject.id).select().single();
    if (data) {
      setProjects(prev => prev.map(p => p.id === data.id ? data as Project : p));
      await logActivity('update', 'project', data.id, data);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id));
      await logActivity('delete', 'project', id, { id });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard loads={loads} fleet={fleetRecords} />;
      case 'loads': return <LoadList loads={loads} fleet={fleetRecords} clients={clients} onAddLoad={handleAddLoad} onUpdateLoad={handleUpdateLoad} onDeleteLoad={handleDeleteLoad} />;
      case 'projects': return <ProjectList projects={projects} clients={clients} onAddProject={handleAddProject} onUpdateProject={handleUpdateProject} onDeleteProject={handleDeleteProject} />;
      case 'fleet': return <FleetList records={fleetRecords} onAddRecord={handleAddFleetRecord} onUpdateRecord={handleUpdateFleetRecord} onDeleteRecord={handleDeleteFleetRecord} />;
      case 'clients': return <ClientList clients={clients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} />;
      case 'daily_rates': return <DailyRatesList records={dailyRates} fleet={fleetRecords} clients={clients} onAddRecord={handleAddDailyRate} />;
      case 'tracking': return <TrackingView loads={loads} supabase={supabase} onUpdateLoad={handleUpdateLoadFromTracking} />;
      case 'calculator': return <FreightCalculator />;
      case 'assistant': return <AIAssistant loads={loads} />;
      case 'settings': return <Settings supabase={supabase} user={user} currentName={userName} currentAvatar={userAvatar} onProfileUpdate={handleProfileUpdate} />;
      default: return <Dashboard loads={loads} fleet={fleetRecords} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} handleLogout={handleLogout} />
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {currentView.charAt(0).toUpperCase() + currentView.slice(1).replace('_', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
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
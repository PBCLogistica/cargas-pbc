import React, { useState, useEffect } from 'react';
import { Load, LoadStatus, TrackingUpdate } from '../types';
import { MapPin, Search, Navigation, Clock, CheckCircle, Calendar, Plus, ExternalLink, Truck, FileCheck, Upload, FileText, LayoutGrid, Map as MapIcon, AlertTriangle, Route, Loader2 } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';
import { BRAZILIAN_CITIES } from '../data/cities';
import { SupabaseClient } from '@supabase/supabase-js';

interface TrackingViewProps {
  loads: Load[];
  supabase: SupabaseClient;
  onUpdateLoad: (loadId: string, deliveryDate: string) => Promise<void>;
}

const getPositionForLocation = (location: string) => {
  const map: Record<string, { top: string; left: string }> = {
    'São Paulo, SP': { top: '70%', left: '65%' }, 'Rio de Janeiro, RJ': { top: '68%', left: '70%' }, 'Curitiba, PR': { top: '75%', left: '60%' }, 'Porto Alegre, RS': { top: '85%', left: '55%' }, 'Belo Horizonte, MG': { top: '60%', left: '72%' }, 'Salvador, BA': { top: '45%', left: '85%' }, 'Recife, PE': { top: '35%', left: '92%' }, 'Fortaleza, CE': { top: '25%', left: '88%' }, 'Manaus, AM': { top: '25%', left: '30%' }, 'Belém, PA': { top: '20%', left: '65%' }, 'Brasília, DF': { top: '55%', left: '60%' }, 'Goiânia, GO': { top: '58%', left: '58%' }, 'Cuiabá, MT': { top: '50%', left: '45%' }, 'Campo Grande, MS': { top: '65%', left: '50%' }, 'Florianópolis, SC': { top: '80%', left: '62%' }, 'Vitória, ES': { top: '65%', left: '78%' }, 'Natal, RN': { top: '30%', left: '94%' },
  };
  return map[location] || { top: `${50 + (Math.random() * 10 - 5)}%`, left: `${55 + (Math.random() * 10 - 5)}%` };
};

export const TrackingView: React.FC<TrackingViewProps> = ({ loads, supabase, onUpdateLoad }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeLoads, setActiveLoads] = useState<Load[]>([]);
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [history, setHistory] = useState<TrackingUpdate[]>([]);
  
  const [updateForm, setUpdateForm] = useState({ location: '', date: new Date().toISOString().slice(0, 16), distance: '', status: 'Em Trânsito', isFinishing: false, hasAttachment: false });
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  useEffect(() => {
    const filtered = loads.filter(l => l.status === LoadStatus.IN_TRANSIT || l.status === LoadStatus.PENDING || l.status === LoadStatus.DELAYED);
    setActiveLoads(filtered);

    const isSelectedLoadActive = filtered.some(l => l.id === selectedLoadId);

    if (!isSelectedLoadActive) {
      setSelectedLoadId(filtered.length > 0 ? filtered[0].id : null);
    }
  }, [loads]);

  useEffect(() => {
    if (!selectedLoadId) {
      setHistory([]);
      return;
    };
    const fetchHistory = async () => {
      const { data } = await supabase.from('tracking_updates').select('*').eq('loadid', selectedLoadId).order('timestamp', { ascending: false });
      if (data) setHistory(data as TrackingUpdate[]);
    };
    fetchHistory();
  }, [selectedLoadId, supabase]);

  const selectedLoad = activeLoads.find(l => l.id === selectedLoadId);
  const loadHistory = history;
  const lastUpdate = loadHistory[0];
  const currentLocation = lastUpdate?.location || selectedLoad?.origin || 'Brasil';

  const handleAddUpdate = async () => {
    if (!selectedLoadId || !updateForm.location) return;

    const finalStatus = updateForm.isFinishing ? 'Entrega Finalizada' : updateForm.status;

    const newUpdateData = {
      id: `TRK-${Date.now()}`,
      loadid: selectedLoadId,
      timestamp: updateForm.date,
      location: updateForm.location,
      status: finalStatus,
      distancetodelivery: updateForm.isFinishing ? 0 : (Number(updateForm.distance) || 0),
      hasattachment: updateForm.hasAttachment
    };

    const { data, error } = await supabase.from('tracking_updates').insert(newUpdateData).select().single();

    if (data) {
      setHistory([data as TrackingUpdate, ...history]);
      if (updateForm.isFinishing) {
        await onUpdateLoad(selectedLoadId, updateForm.date);
      }
      setUpdateForm({ location: '', date: new Date().toISOString().slice(0, 16), distance: '', status: 'Em Trânsito', isFinishing: false, hasAttachment: false });
    }
  };

  const handleCalculateDistance = () => {
    if (!updateForm.location || !selectedLoad) return;
    setIsCalculatingDistance(true);
    setTimeout(() => {
        const lastDistance = loadHistory[0]?.distancetodelivery;
        let newDistance;
        if (lastDistance && lastDistance > 50) {
            const travelSegment = 50 + Math.random() * 100;
            newDistance = Math.max(0, Math.floor(lastDistance - travelSegment));
        } else {
            newDistance = Math.floor(100 + Math.random() * 700);
        }
        setUpdateForm(prev => ({ ...prev, distance: newDistance.toString() }));
        setIsCalculatingDistance(false);
    }, 800);
  };

  const toggleFinishing = (checked: boolean) => {
    setUpdateForm(prev => ({ ...prev, isFinishing: checked, status: checked ? 'Entrega Finalizada' : 'Em Trânsito', distance: checked ? '0' : prev.distance }));
  };

  const renderMapView = () => {
    const delayedCount = activeLoads.filter(l => l.status === LoadStatus.DELAYED).length;
    const onTimeCount = activeLoads.filter(l => l.status === LoadStatus.IN_TRANSIT).length;

    return (
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col">
        <div className="absolute inset-0 opacity-40">
           <iframe 
              width="100%" height="100%" frameBorder="0" scrolling="no" 
              src={`https://maps.google.com/maps?q=Brazil&t=m&z=4&ie=UTF8&iwloc=&output=embed`}
              style={{ filter: 'invert(90%) hue-rotate(180deg)' }}
              title="Global View" className="w-full h-full pointer-events-none"
            ></iframe>
        </div>
        <div className="absolute top-4 left-4 z-10 space-y-3">
           <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl text-white w-64">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Status da Frota</h3>
              <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div><span className="text-sm">Em Trânsito</span></div>
                 <span className="font-bold text-lg">{onTimeCount}</span>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-sm">Atrasados</span></div>
                 <span className="font-bold text-lg">{delayedCount}</span>
              </div>
           </div>
        </div>
        <div className="absolute inset-0 z-0 top-10 left-10 right-10 bottom-10 pointer-events-none">
            {activeLoads.map(load => {
               const lastLoc = history.find(h => h.loadid === load.id)?.location || load.origin;
               const pos = getPositionForLocation(lastLoc);
               const isDelayed = load.status === LoadStatus.DELAYED;
               return (
                 <div key={load.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group pointer-events-auto cursor-pointer" style={{ top: pos.top, left: pos.left }}
                    onClick={() => { setSelectedLoadId(load.id); setViewMode('list'); }}>
                    <div className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${isDelayed ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                    <div className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg ${isDelayed ? 'bg-red-600' : 'bg-indigo-600'}`}></div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-white rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                       <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-slate-800 text-xs">{load.id}</span>
                          <span className={`text-[10px] font-bold ${isDelayed ? 'text-red-600' : 'text-emerald-600'}`}>{isDelayed ? 'ATRASADO' : 'NO PRAZO'}</span>
                       </div>
                       <p className="text-[10px] text-slate-500 mb-1 truncate">{lastLoc}</p>
                       <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium"><Truck size={10} /><span>{load.driver}</span></div>
                       <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-indigo-600 text-center font-bold">Clique para detalhes</div>
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white transform rotate-45"></div>
                    </div>
                 </div>
               )
            })}
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">*Visualização simulada (Controle de Torre)</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 z-20">
         <div><h3 className="font-bold text-slate-800">Central de Rastreamento</h3><p className="text-xs text-slate-500">Monitoramento em tempo real</p></div>
         <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={16} />Lista Detalhada</button>
            <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><MapIcon size={16} />Painel Mapa</button>
         </div>
      </div>
      {viewMode === 'map' ? renderMapView() : (
        <div className="flex-1 flex overflow-hidden">
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50 flex-shrink-0">
                <div className="p-4 border-b border-slate-200"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="Buscar ID ou Motorista..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div></div>
                <div className="flex-1 overflow-y-auto">
                {activeLoads.map(load => (
                    <button key={load.id} onClick={() => setSelectedLoadId(load.id)} className={`w-full text-left p-4 border-b border-slate-100 transition-colors hover:bg-white ${selectedLoadId === load.id ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : 'border-l-4 border-l-transparent'}`}>
                    <div className="flex justify-between items-start mb-1"><span className="font-bold text-slate-800 text-sm">{load.id}</span><span className={`text-[10px] px-2 py-0.5 rounded-full ${load.status === LoadStatus.DELAYED ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>{load.status}</span></div>
                    <div className="text-xs text-slate-500 mb-1 truncate">{load.origin} → {load.destination}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Navigation size={12} /><span>{load.driver}</span></div>
                    </button>
                ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {selectedLoad ? (
                <>
                    <div className="flex-1 flex flex-col overflow-y-auto">
                    <div className="p-6 bg-white border-b border-slate-100">
                        <div className="flex items-start justify-between">
                        <div><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Truck className="text-indigo-600" />{selectedLoad.origin} <span className="text-slate-300">→</span> {selectedLoad.destination}</h2><p className="text-sm text-slate-500 mt-1">Motorista: {selectedLoad.driver} • Placa: {selectedLoad.truckplate} • Previsão: {new Date(selectedLoad.forecastdate).toLocaleDateString()}</p></div>
                        <div className="text-right"><div className="text-2xl font-bold text-slate-800">{lastUpdate ? `${lastUpdate.distancetodelivery} km` : '---'}</div><p className="text-xs text-slate-500 uppercase font-semibold">Distância Restante</p></div>
                        </div>
                    </div>
                    <div className="h-64 bg-slate-100 w-full relative group shrink-0">
                        <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={`https://maps.google.com/maps?q=${encodeURIComponent(currentLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`} className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" title="Map View"></iframe>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg shadow-sm text-xs font-medium text-slate-700 pointer-events-none">Local Atual: {currentLocation}</div>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLocation)}`} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 bg-white text-indigo-600 px-3 py-2 rounded-lg shadow-md text-xs font-bold flex items-center gap-1 hover:bg-slate-50">Abrir no Google Maps <ExternalLink size={12}/></a>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex-1">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-indigo-600" />Nova Atualização</h4>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!updateForm.isFinishing && (<div><label className="block text-xs font-medium text-slate-600 mb-1">Data/Hora</label><input type="datetime-local" value={updateForm.date} onChange={e => setUpdateForm({...updateForm, date: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm"/></div>)}
                                <div className={updateForm.isFinishing ? "md:col-span-2" : ""}><label className="block text-xs font-medium text-slate-600 mb-1">Local Atual (Cidade/UF)</label><AutocompleteInput value={updateForm.location} onChange={value => setUpdateForm({...updateForm, location: value})} suggestions={BRAZILIAN_CITIES} placeholder="Ex: São Paulo, SP"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Distância Restante (km)</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" placeholder="Clique em calcular" value={updateForm.distance} onChange={e => setUpdateForm({...updateForm, distance: e.target.value})} disabled={updateForm.isFinishing || isCalculatingDistance} className={`w-full p-2 border border-slate-200 rounded-lg text-sm ${updateForm.isFinishing || isCalculatingDistance ? 'bg-slate-100 text-slate-400' : ''}`}/>
                                        <button onClick={handleCalculateDistance} disabled={!updateForm.location || isCalculatingDistance} className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 transition-colors flex-shrink-0" title="Calcular distância automaticamente">{isCalculatingDistance ? <Loader2 size={18} className="animate-spin" /> : <Route size={18} />}</button>
                                    </div>
                                </div>
                                <div className={`border rounded-lg p-3 transition-colors ${updateForm.isFinishing ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-slate-200'}`}>
                                    <label className="flex items-center gap-2 cursor-pointer select-none mb-1"><input type="checkbox" checked={updateForm.isFinishing} onChange={e => toggleFinishing(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" /><span className={`text-sm font-medium ${updateForm.isFinishing ? 'text-indigo-900' : 'text-slate-700'}`}>Finalizar Entrega</span></label>
                                    {updateForm.isFinishing && (<div className="mt-3 pt-3 border-t border-indigo-100 animate-fade-in"><label className="block text-xs font-medium text-indigo-700 mb-1">Data/Hora da Entrega (Retroativo)</label><input type="datetime-local" value={updateForm.date} onChange={e => setUpdateForm({...updateForm, date: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"/><p className="text-[10px] text-indigo-500 mt-1">Informe a data real caso a entrega já tenha ocorrido.</p></div>)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Comprovante de Entrega</label>
                                <div className="border border-dashed border-slate-300 rounded-lg p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setUpdateForm({...updateForm, hasAttachment: !!e.target.files?.length})} />
                                    <div className="flex items-center gap-2">{updateForm.hasAttachment ? (<><FileCheck size={18} className="text-emerald-500" /><span className="text-sm text-emerald-700 font-medium">Arquivo selecionado</span></>) : (<><Upload size={18} className="text-slate-400" /><span className="text-sm text-slate-500">Clique para anexar foto/PDF</span></>)}</div>
                                    {updateForm.hasAttachment && (<span className="text-xs text-slate-400">Alterar</span>)}
                                </div>
                            </div>
                            <button onClick={handleAddUpdate} disabled={!updateForm.location} className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${!updateForm.location ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}><Plus size={16} />Adicionar Atualização</button>
                        </div>
                    </div>
                    </div>
                    <div className="w-80 bg-white border-l border-slate-100 p-6 overflow-y-auto hidden xl:block">
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Clock size={18} className="text-slate-400" />Histórico de Viagem</h4>
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {loadHistory.length === 0 ? (<p className="text-sm text-slate-400 italic text-center">Nenhum registro encontrado.</p>) : (
                            loadHistory.map((update, idx) => (
                            <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${update.status === 'Entrega Finalizada' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-indigo-600'}`}>{update.status === 'Entrega Finalizada' ? <CheckCircle size={18} /> : (idx === 0 ? <MapPin size={18} /> : <CheckCircle size={16} className="text-slate-400" />)}</div>
                                <div className="w-full ml-4">
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-1"><span className="font-bold text-slate-700 text-sm truncate w-24">{update.location}</span><span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 whitespace-nowrap">{new Date(update.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                                        <div className={`text-xs mb-1 font-medium ${update.status === 'Entrega Finalizada' ? 'text-emerald-600' : 'text-slate-500'}`}>{update.status}</div>
                                        {update.distancetodelivery > 0 && (<div className="text-[10px] text-indigo-600 font-medium">Faltam {update.distancetodelivery} km</div>)}
                                        <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1"><Calendar size={10} />{new Date(update.timestamp).toLocaleDateString()}</div>
                                            {update.hasattachment && (<div className="flex items-center gap-1 text-indigo-500 cursor-pointer hover:underline" title="Ver Comprovante"><FileText size={10} /><span>Comprovante</span></div>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))
                        )}
                    </div>
                    </div>
                </>
                ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50"><MapPin size={48} className="mb-4 opacity-20" /><p>Selecione uma carga para visualizar o rastreamento.</p></div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
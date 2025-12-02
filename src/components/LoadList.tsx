import React, { useState } from 'react';
import { Load, LoadStatus, FleetRecord } from '../types';
import { Search, Filter, MoreVertical, Calendar, DollarSign, Weight, Plus, X, Save, Trash2 } from 'lucide-react';

interface LoadListProps {
  loads: Load[];
  fleet: FleetRecord[];
  onAddLoad: (load: Load) => void;
  onDeleteLoad: (id: string) => void;
}

export const LoadList: React.FC<LoadListProps> = ({ loads, fleet, onAddLoad, onDeleteLoad }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoadStatus | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Load>>({
    date: new Date().toISOString().split('T')[0],
    client: '',
    origin: '',
    destination: '',
    driver: '',
    vehicleType: '',
    truckPlate: '',
    trailerPlate: '',
    weight: 0,
    companyValue: 0,
    driverValue: 0,
    finalValue: 0,
    toll: 0,
    adValorem: 0,
    icms: true,
    pisConfins: true,
    forecastDate: '',
    deliveryDate: '',
    status: LoadStatus.PENDING,
    observation: ''
  });

  const handleDriverChange = (driverName: string) => {
    const selectedFleetRecord = fleet.find(f => f.driverName === driverName);
    
    setFormData(prev => ({
      ...prev,
      driver: driverName,
      // Auto-populate if record found
      vehicleType: selectedFleetRecord ? selectedFleetRecord.truckType : prev.vehicleType,
      truckPlate: selectedFleetRecord ? selectedFleetRecord.truckPlate : prev.truckPlate,
      trailerPlate: selectedFleetRecord ? selectedFleetRecord.trailerPlate : prev.trailerPlate,
      weight: selectedFleetRecord ? selectedFleetRecord.capacity : prev.weight
    }));
  };

  const filteredLoads = loads.filter(load => {
    const matchesSearch = 
      load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || load.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: LoadStatus) => {
    switch (status) {
      case LoadStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case LoadStatus.IN_TRANSIT: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case LoadStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case LoadStatus.DELAYED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleSave = () => {
    if (!formData.client || !formData.origin || !formData.destination) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    const newLoad: Load = {
      id: `PBC-${(loads.length + 1).toString().padStart(3, '0')}`,
      date: formData.date || '',
      client: formData.client || '',
      origin: formData.origin || '',
      destination: formData.destination || '',
      driver: formData.driver || '',
      vehicleType: formData.vehicleType || '',
      truckPlate: formData.truckPlate || '',
      trailerPlate: formData.trailerPlate || '',
      weight: Number(formData.weight) || 0,
      companyValue: Number(formData.companyValue) || 0,
      driverValue: Number(formData.driverValue) || 0,
      finalValue: Number(formData.finalValue) || 0,
      toll: Number(formData.toll) || 0,
      adValorem: Number(formData.adValorem) || 0,
      icms: !!formData.icms,
      pisConfins: !!formData.pisConfins,
      forecastDate: formData.forecastDate || '',
      deliveryDate: formData.deliveryDate || '',
      status: formData.status || LoadStatus.PENDING,
      observation: formData.observation || ''
    };

    onAddLoad(newLoad);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      client: '',
      origin: '',
      destination: '',
      driver: '',
      vehicleType: '',
      truckPlate: '',
      trailerPlate: '',
      weight: 0,
      companyValue: 0,
      driverValue: 0,
      finalValue: 0,
      toll: 0,
      adValorem: 0,
      icms: true,
      pisConfins: true,
      forecastDate: '',
      deliveryDate: '',
      status: LoadStatus.PENDING,
      observation: ''
    });
  };

  const handleDelete = (id: string, loadIdentifier: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a carga ${loadIdentifier}?`)) {
      onDeleteLoad(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Header / Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Gerenciamento de Cargas</h2>
          <p className="text-sm text-slate-500">Visualizando {filteredLoads.length} registros</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar carga, motorista..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full sm:w-64"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LoadStatus | 'All')}
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="All">Todos os Status</option>
              {Object.values(LoadStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nova Carga</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">ID / Data</th>
              <th className="px-6 py-4 border-b border-slate-200">Rota</th>
              <th className="px-6 py-4 border-b border-slate-200">Motorista / Veículo</th>
              <th className="px-6 py-4 border-b border-slate-200 text-right">Financeiro</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Status</th>
              <th className="px-6 py-4 border-b border-slate-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLoads.map((load) => (
              <tr key={load.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 align-top">
                  <div className="font-bold text-slate-900">{load.id}</div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <Calendar size={12} />
                    {new Date(load.date).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-slate-900 font-medium">{load.origin}</span>
                    </div>
                    <div className="border-l border-slate-300 h-3 ml-1 my-0.5"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full border border-slate-400"></div>
                      <span className="text-slate-600">{load.destination}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="font-medium text-slate-900">{load.driver}</div>
                  <div className="text-xs text-slate-500 mt-1">{load.vehicleType} • {load.truckPlate}</div>
                </td>
                <td className="px-6 py-4 align-top text-right">
                  <div className="flex items-center justify-end gap-1 text-slate-900 font-medium">
                    <DollarSign size={14} className="text-slate-400" />
                    {load.companyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mt-1">
                    <Weight size={12} />
                    {(load.weight / 1000).toFixed(1)}t
                  </div>
                </td>
                <td className="px-6 py-4 align-top text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(load.status)}`}>
                    {load.status}
                  </span>
                </td>
                <td className="px-6 py-4 align-top text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors" title="Opções">
                      <MoreVertical size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(load.id, load.id)}
                      className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Excluir Carga"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLoads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p>Nenhuma carga encontrada com os filtros atuais.</p>
          </div>
        )}
      </div>

       {/* Create Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative z-10 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">Nova Carga</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Section: Dados Gerais */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Dados Gerais</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Emissão</label>
                        <input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-sm" 
                               value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as LoadStatus})}>
                            {Object.values(LoadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                    <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Nome do Cliente"
                           value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                  </div>
                </div>

                {/* Section: Rota e Veículo */}
                <div className="space-y-4">
                   <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Rota e Veículo</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Origem</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Cidade, UF"
                             value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Destino</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Cidade, UF"
                             value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Motorista</label>
                      <select 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        value={formData.driver} 
                        onChange={e => handleDriverChange(e.target.value)}
                      >
                        <option value="">Selecione um motorista...</option>
                        {fleet.map(record => (
                           <option key={record.id} value={record.driverName}>{record.driverName} - {record.truckType}</option>
                        ))}
                      </select>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" placeholder="Ex: Baú"
                            value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Placa Cavalo</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm uppercase bg-slate-50" placeholder="ABC-1234"
                            value={formData.truckPlate} onChange={e => setFormData({...formData, truckPlate: e.target.value.toUpperCase()})} />
                      </div>
                      <div>
                         <label className="block text-xs font-medium text-slate-700 mb-1">Placa Carreta</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm uppercase bg-slate-50" placeholder="XYZ-9999"
                            value={formData.trailerPlate} onChange={e => setFormData({...formData, trailerPlate: e.target.value.toUpperCase()})} />
                      </div>
                   </div>
                   <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade (kg)</label>
                        <input type="number" className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" placeholder="0"
                             value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
                   </div>
                </div>

                {/* Section: Prazos e Observação */}
                <div className="space-y-4">
                   <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Prazos e Detalhes</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Previsão Entrega</label>
                        <input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-sm" 
                             value={formData.forecastDate} onChange={e => setFormData({...formData, forecastDate: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Entrega</label>
                        <input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-sm" 
                             value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                      </div>
                   </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                        <textarea className="w-full p-2 border border-slate-200 rounded-lg text-sm resize-none h-20" placeholder="Observações gerais da carga..."
                             value={formData.observation} onChange={e => setFormData({...formData, observation: e.target.value})}></textarea>
                    </div>
                </div>

                 {/* Section: Financeiro e Impostos */}
                 <div className="space-y-4">
                   <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Financeiro</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor Empresa</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="number" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00"
                                value={formData.companyValue} onChange={e => setFormData({...formData, companyValue: Number(e.target.value)})} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor Motorista</label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="number" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00"
                                value={formData.driverValue} onChange={e => setFormData({...formData, driverValue: Number(e.target.value)})} />
                         </div>
                      </div>
                   </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pedágio</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="number" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00"
                                value={formData.toll} onChange={e => setFormData({...formData, toll: Number(e.target.value)})} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Valorem</label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="number" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00"
                                value={formData.adValorem} onChange={e => setFormData({...formData, adValorem: Number(e.target.value)})} />
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.icms} onChange={e => setFormData({...formData, icms: e.target.checked})} 
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"/>
                            <span className="text-sm text-slate-700">Incide ICMS</span>
                        </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.pisConfins} onChange={e => setFormData({...formData, pisConfins: e.target.checked})} 
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"/>
                            <span className="text-sm text-slate-700">Incide PIS/COFINS</span>
                        </label>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Final Calculado</label>
                       <div className="text-xl font-bold text-emerald-600">
                           R$ {(Number(formData.companyValue || 0) - Number(formData.driverValue || 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                       </div>
                   </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                <Save size={18} />
                Salvar Carga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Load, LoadStatus, FleetRecord, Client } from '../types';
import { Search, Filter, MoreVertical, Calendar, DollarSign, Weight, Plus, X, Save, Trash2, Download, Pencil, Building2, User } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AutocompleteInput } from './AutocompleteInput';
import { BRAZILIAN_CITIES } from '../data/cities';
import { useInputHistory } from '../hooks/useInputHistory';

interface LoadListProps {
  loads: Load[];
  fleet: FleetRecord[];
  clients: Client[];
  onAddLoad: (load: Omit<Load, 'id' | 'numeric_id'>) => void;
  onUpdateLoad: (load: Load) => void;
  onDeleteLoad: (id: string) => void;
}

const emptyForm: Partial<Load> = {
  date: new Date().toISOString().split('T')[0],
  client: '',
  tomador: '',
  origin: '',
  destination: '',
  driver: '',
  vehicletype: '',
  truckplate: '',
  trailerplate: '',
  weight: 0,
  companyvalue: 0,
  drivervalue: 0,
  finalvalue: 0,
  toll: 0,
  advalorem: 0,
  icms: true,
  pisconfins: true,
  forecastdate: '',
  deliverydate: '',
  status: LoadStatus.PENDING,
  observation: ''
};

export const LoadList: React.FC<LoadListProps> = ({ loads, fleet, clients, onAddLoad, onUpdateLoad, onDeleteLoad }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoadStatus | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Load>>(emptyForm);
  
  // History Hook
  const [observationHistory, addObservation] = useInputHistory('observation');

  const handleDriverChange = (driverName: string) => {
    const selectedFleetRecord = fleet.find(f => f.drivername === driverName);
    
    setFormData(prev => ({
      ...prev,
      driver: driverName,
      vehicletype: selectedFleetRecord ? selectedFleetRecord.trucktype : prev.vehicletype,
      truckplate: selectedFleetRecord ? selectedFleetRecord.truckplate : prev.truckplate,
      trailerplate: selectedFleetRecord ? selectedFleetRecord.trailerplate : prev.trailerplate,
      weight: selectedFleetRecord ? selectedFleetRecord.capacity : prev.weight
    }));
  };

  const openModalForNew = () => {
    setEditingLoad(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openModalForEdit = (load: Load) => {
    setEditingLoad(load);
    setFormData(load);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLoad(null);
    setFormData(emptyForm);
  };

  const filteredLoads = loads.filter(load => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      load.origin.toLowerCase().includes(searchTermLower) ||
      load.destination.toLowerCase().includes(searchTermLower) ||
      load.driver.toLowerCase().includes(searchTermLower) ||
      load.id.toLowerCase().includes(searchTermLower) ||
      load.client.toLowerCase().includes(searchTermLower) ||
      (load.tomador && load.tomador.toLowerCase().includes(searchTermLower)) ||
      (load.numeric_id && load.numeric_id.toString().includes(searchTermLower));
    
    const matchesStatus = filterStatus === 'All' || load.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: LoadStatus) => {
    switch (status) {
      case LoadStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case LoadStatus.LOADING: return 'bg-blue-100 text-blue-700 border-blue-200';
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

    if (formData.observation) {
      addObservation(formData.observation);
    }

    if (editingLoad) {
      onUpdateLoad({ ...editingLoad, ...formData });
    } else {
      const newLoad: Omit<Load, 'id' | 'numeric_id'> = {
        date: formData.date || new Date().toISOString().split('T')[0],
        client: formData.client || '',
        tomador: formData.tomador || '',
        origin: formData.origin || '',
        destination: formData.destination || '',
        driver: formData.driver || '',
        vehicletype: formData.vehicletype || '',
        truckplate: formData.truckplate || '',
        trailerplate: formData.trailerplate || '',
        weight: formData.weight || 0,
        companyvalue: formData.companyvalue || 0,
        drivervalue: formData.drivervalue || 0,
        finalvalue: formData.finalvalue || 0,
        toll: formData.toll || 0,
        advalorem: formData.advalorem || 0,
        icms: formData.icms === undefined ? true : formData.icms,
        pisconfins: formData.pisconfins === undefined ? true : formData.pisconfins,
        forecastdate: formData.forecastdate || '',
        deliverydate: formData.deliverydate || '',
        status: formData.status || LoadStatus.PENDING,
        observation: formData.observation || ''
      };
      onAddLoad(newLoad);
    }
    closeModal();
  };

  const handleDelete = (id: string, loadIdentifier: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a carga ${loadIdentifier}?`)) {
      onDeleteLoad(id);
    }
  };

  const handleExport = () => {
    if (filteredLoads.length === 0) {
      alert("Nenhuma carga para exportar.");
      return;
    }

    const dataToExport = filteredLoads.map(load => ({
      'ID Carga': load.numeric_id,
      'Data Emissão': load.date,
      'Cliente': load.client,
      'Tomador do Frete': load.tomador,
      'Origem': load.origin,
      'Destino': load.destination,
      'Motorista': load.driver,
      'Placa Cavalo': load.truckplate,
      'Placa Carreta': load.trailerplate,
      'Peso (kg)': load.weight,
      'Valor Empresa': load.companyvalue,
      'Valor Motorista': load.drivervalue,
      'Pedágio': load.toll,
      'Status': load.status,
      'Observação': load.observation,
      'ID Secundário': load.id
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cargas");

    XLSX.writeFile(workbook, `export_cargas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    fieldName: keyof Load,
    isCurrency: boolean = false
  ) => {
    const rawValue = e.target.value;
    const numericString = rawValue.replace(/\D/g, '');

    if (numericString === '') {
      setFormData(prev => ({ ...prev, [fieldName]: 0 }));
      return;
    }

    let numberValue: number;
    if (isCurrency) {
      numberValue = parseFloat(numericString) / 100;
    } else {
      numberValue = parseInt(numericString, 10);
    }

    setFormData(prev => ({ ...prev, [fieldName]: numberValue }));
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
              placeholder="Buscar cliente, carga..." 
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
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Download size={18} />
          </button>

          <button 
            onClick={openModalForNew}
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
              <th className="px-6 py-4 border-b border-slate-200">Carga / Data</th>
              <th className="px-6 py-4 border-b border-slate-200">Cliente / Rota</th>
              <th className="px-6 py-4 border-b border-slate-200">Motorista / Veículo</th>
              <th className="px-6 py-4 border-b border-slate-200 text-right">Financeiro</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Status</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLoads.map((load) => (
              <tr key={load.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 align-top">
                  <div className="font-bold text-slate-900">#{load.numeric_id}</div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <Calendar size={12} />
                    {new Date(load.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{load.id}</div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400" />
                    {load.client}
                  </div>
                  {load.tomador && (
                    <div className="text-xs text-slate-500 mt-1 pl-6">Tomador: {load.tomador}</div>
                  )}
                  <div className="flex flex-col gap-1 mt-2 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-slate-600">{load.origin}</span>
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
                  <div className="text-xs text-slate-500 mt-1">{load.vehicletype} • {load.truckplate}</div>
                </td>
                <td className="px-6 py-4 align-top text-right">
                  <div className="flex items-center justify-end gap-1 text-slate-900 font-medium">
                    <DollarSign size={14} className="text-slate-400" />
                    {load.companyvalue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <td className="px-6 py-4 align-top text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openModalForEdit(load)} className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar Carga">
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(load.id, `#${load.numeric_id}`)}
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

       {/* Create/Edit Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative z-10 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{editingLoad ? `Editar Carga #${editingLoad.numeric_id}` : 'Nova Carga'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
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
                    <select 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                        value={formData.client} 
                        onChange={e => setFormData({...formData, client: e.target.value})}
                    >
                        <option value="">Selecione um cliente...</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.companyname}>{client.companyname}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tomador do Frete</label>
                    <AutocompleteInput
                        value={formData.tomador || ''}
                        onChange={value => setFormData({ ...formData, tomador: value })}
                        suggestions={clients.map(c => c.companyname)}
                        placeholder="Selecione ou digite o tomador"
                    />
                  </div>
                </div>

                {/* Section: Rota e Veículo */}
                <div className="space-y-4">
                   <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Rota e Veículo</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Origem</label>
                        <AutocompleteInput
                            value={formData.origin || ''}
                            onChange={value => setFormData({ ...formData, origin: value })}
                            suggestions={BRAZILIAN_CITIES}
                            placeholder="Cidade, UF"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Destino</label>
                        <AutocompleteInput
                            value={formData.destination || ''}
                            onChange={value => setFormData({ ...formData, destination: value })}
                            suggestions={BRAZILIAN_CITIES}
                            placeholder="Cidade, UF"
                        />
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
                           <option key={record.id} value={record.drivername}>{record.drivername} - {record.trucktype}</option>
                        ))}
                      </select>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" placeholder="Ex: Baú"
                            value={formData.vehicletype} onChange={e => setFormData({...formData, vehicletype: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Placa Cavalo</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm uppercase bg-slate-50" placeholder="ABC-1234"
                            value={formData.truckplate} onChange={e => setFormData({...formData, truckplate: e.target.value.toUpperCase()})} />
                      </div>
                      <div>
                         <label className="block text-xs font-medium text-slate-700 mb-1">Placa Carreta</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm uppercase bg-slate-50" placeholder="XYZ-9999"
                            value={formData.trailerplate} onChange={e => setFormData({...formData, trailerplate: e.target.value.toUpperCase()})} />
                      </div>
                   </div>
                   <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade (kg)</label>
                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" placeholder="0"
                             value={(formData.weight || 0).toLocaleString('pt-BR')} 
                             onChange={e => handleNumericChange(e, 'weight', false)} />
                   </div>
                </div>

                {/* Section: Prazos e Observação */}
                <div className="space-y-4">
                   <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Prazos e Detalhes</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Previsão Entrega</label>
                        <input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-sm" 
                             value={formData.forecastdate} onChange={e => setFormData({...formData, forecastdate: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Entrega</label>
                        <input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-sm" 
                             value={formData.deliverydate} onChange={e => setFormData({...formData, deliverydate: e.target.value})} />
                      </div>
                   </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                        <AutocompleteInput
                            value={formData.observation || ''}
                            onChange={value => setFormData({ ...formData, observation: value })}
                            suggestions={observationHistory}
                            placeholder="Observações gerais da carga..."
                        />
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
                            <input type="text" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm" placeholder="R$ 0,00"
                                value={(formData.companyvalue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                                onChange={e => handleNumericChange(e, 'companyvalue', true)} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor Motorista</label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="text" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm" placeholder="R$ 0,00"
                                value={(formData.drivervalue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                                onChange={e => handleNumericChange(e, 'drivervalue', true)} />
                         </div>
                      </div>
                   </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pedágio</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="text" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm" placeholder="R$ 0,00"
                                value={(formData.toll || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                                onChange={e => handleNumericChange(e, 'toll', true)} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Valorem</label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="text" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm" placeholder="R$ 0,00"
                                value={(formData.advalorem || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                                onChange={e => handleNumericChange(e, 'advalorem', true)} />
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
                            <input type="checkbox" checked={formData.pisconfins} onChange={e => setFormData({...formData, pisconfins: e.target.checked})} 
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"/>
                            <span className="text-sm text-slate-700">Incide PIS/COFINS</span>
                        </label>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor Final</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                            <input type="text" className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-lg font-bold text-emerald-600 bg-white" placeholder="R$ 0,00"
                                value={(formData.finalvalue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                                onChange={e => handleNumericChange(e, 'finalvalue', true)} />
                        </div>
                   </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={closeModal}
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
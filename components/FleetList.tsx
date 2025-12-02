import React, { useState } from 'react';
import { FleetRecord } from '../types';
import { Search, Plus, User, Truck, Settings2, X, Save } from 'lucide-react';

interface FleetListProps {
  records: FleetRecord[];
  onAddRecord: (record: FleetRecord) => void;
}

export const FleetList: React.FC<FleetListProps> = ({ records, onAddRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<FleetRecord>>({
    driverName: '',
    truckPlate: '',
    trailerPlate: '',
    truckType: 'Carreta Baú',
    ownershipType: 'Frota',
    capacity: 0
  });

  const handleSave = () => {
    if (!formData.driverName || !formData.truckPlate) return;
    
    const newRecord: FleetRecord = {
      id: `FL-${(records.length + 1).toString().padStart(3, '0')}`,
      driverName: formData.driverName,
      truckPlate: formData.truckPlate,
      trailerPlate: formData.trailerPlate || 'N/A',
      truckType: formData.truckType || 'Outro',
      ownershipType: formData.ownershipType as 'Frota' | 'Terceiro',
      capacity: Number(formData.capacity) || 0
    };

    onAddRecord(newRecord);
    setIsModalOpen(false);
    setFormData({
      driverName: '',
      truckPlate: '',
      trailerPlate: '',
      truckType: 'Carreta Baú',
      ownershipType: 'Frota',
      capacity: 0
    });
  };

  const filteredRecords = records.filter(record => 
    record.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.truckPlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Gestão de Frota e Motoristas</h2>
          <p className="text-sm text-slate-500">Cadastre motoristas, cavalos e carretas</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar motorista ou placa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Cadastro</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Motorista</th>
              <th className="px-6 py-4 border-b border-slate-200">Conjunto (Cavalo / Carreta)</th>
              <th className="px-6 py-4 border-b border-slate-200">Tipo</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Vínculo</th>
              <th className="px-6 py-4 border-b border-slate-200 text-right">Capacidade</th>
              <th className="px-6 py-4 border-b border-slate-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{record.driverName}</div>
                      <div className="text-xs text-slate-400">ID: {record.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-mono text-xs border border-slate-200">{record.truckPlate}</span>
                      <span className="text-slate-300">/</span>
                      <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-mono text-xs border border-slate-200">{record.trailerPlate}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-slate-400" />
                    <span>{record.truckType}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    record.ownershipType === 'Frota' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {record.ownershipType}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {(record.capacity / 1000).toLocaleString('pt-BR')} ton
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg transition-colors">
                    <Settings2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Novo Cadastro</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Motorista</label>
                <input 
                  type="text" 
                  value={formData.driverName}
                  onChange={e => setFormData({...formData, driverName: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Placa Cavalo</label>
                  <input 
                    type="text" 
                    value={formData.truckPlate}
                    onChange={e => setFormData({...formData, truckPlate: e.target.value.toUpperCase()})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Placa Carreta</label>
                  <input 
                    type="text" 
                    value={formData.trailerPlate}
                    onChange={e => setFormData({...formData, trailerPlate: e.target.value.toUpperCase()})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    placeholder="XYZ-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Caminhão</label>
                  <select 
                    value={formData.truckType}
                    onChange={e => setFormData({...formData, truckType: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Carreta Baú">Carreta Baú</option>
                    <option value="Sider">Sider</option>
                    <option value="Graneleiro">Graneleiro</option>
                    <option value="Truck">Truck</option>
                    <option value="Bitrem">Bitrem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vínculo</label>
                  <select 
                    value={formData.ownershipType}
                    onChange={e => setFormData({...formData, ownershipType: e.target.value as any})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Frota">Próprio (Frota)</option>
                    <option value="Terceiro">Terceiro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade de Carga (kg)</label>
                <input 
                  type="number" 
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: 32000"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
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
                Salvar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
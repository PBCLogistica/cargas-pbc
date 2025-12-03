import React, { useState } from 'react';
import { FleetRecord } from '../types';
import { Search, Plus, User, Truck, Settings2, X, Save, Trash2, Download, Pencil } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FleetListProps {
  records: FleetRecord[];
  onAddRecord: (record: Omit<FleetRecord, 'id'>) => void;
  onUpdateRecord: (record: FleetRecord) => void;
  onDeleteRecord: (id: string) => void;
}

const emptyForm: Partial<FleetRecord> = {
  drivername: '',
  truckplate: '',
  trailerplate: '',
  trucktype: 'carreta baú',
  ownershiptype: 'Frota',
  capacity: 0
};

export const FleetList: React.FC<FleetListProps> = ({ records, onAddRecord, onUpdateRecord, onDeleteRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FleetRecord | null>(null);
  
  const [formData, setFormData] = useState<Partial<FleetRecord>>(emptyForm);

  const openModalForNew = () => {
    setEditingRecord(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openModalForEdit = (record: FleetRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormData(emptyForm);
  };

  const handleSave = () => {
    if (!formData.drivername || !formData.truckplate) return;
    
    if (editingRecord) {
      onUpdateRecord({ ...editingRecord, ...formData });
    } else {
      const newRecord: Omit<FleetRecord, 'id'> = {
        drivername: formData.drivername || '',
        truckplate: formData.truckplate || '',
        trailerplate: formData.trailerplate || '',
        trucktype: formData.trucktype || 'carreta baú',
        ownershiptype: formData.ownershiptype || 'Frota',
        capacity: formData.capacity || 0
      };
      onAddRecord(newRecord);
    }
    closeModal();
  };

  const handleDelete = (id: string, driverName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cadastro de ${driverName}?`)) {
      onDeleteRecord(id);
    }
  };

  const filteredRecords = records.filter(record => 
    record.drivername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.truckplate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert("Nenhum registro de frota para exportar.");
      return;
    }

    const dataToExport = filteredRecords.map(rec => ({
      'ID': rec.id,
      'Motorista': rec.drivername,
      'Placa Cavalo': rec.truckplate,
      'Placa Carreta': rec.trailerplate,
      'Tipo Veículo': rec.trucktype,
      'Vínculo': rec.ownershiptype,
      'Capacidade (kg)': rec.capacity
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Frota");

    XLSX.writeFile(workbook, `export_frota_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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
              <th className="px-6 py-4 border-b border-slate-200 text-center">Ações</th>
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
                      <div className="font-bold text-slate-900">{record.drivername}</div>
                      <div className="text-xs text-slate-400">ID: {record.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-mono text-xs border border-slate-200">{record.truckplate}</span>
                      <span className="text-slate-300">/</span>
                      <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-mono text-xs border border-slate-200">{record.trailerplate}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-slate-400" />
                    <span>{record.trucktype}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    record.ownershiptype === 'Frota' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {record.ownershiptype}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {(record.capacity / 1000).toLocaleString('pt-BR')} ton
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openModalForEdit(record)} className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg transition-colors" title="Editar">
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id, record.drivername)}
                      className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors" 
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingRecord ? 'Editar Cadastro' : 'Novo Cadastro'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Motorista</label>
                <input 
                  type="text" 
                  value={formData.drivername}
                  onChange={e => setFormData({...formData, drivername: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Placa Cavalo</label>
                  <input 
                    type="text" 
                    value={formData.truckplate}
                    onChange={e => setFormData({...formData, truckplate: e.target.value.toUpperCase()})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Placa Carreta</label>
                  <input 
                    type="text" 
                    value={formData.trailerplate}
                    onChange={e => setFormData({...formData, trailerplate: e.target.value.toUpperCase()})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    placeholder="XYZ-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Caminhão</label>
                  <select 
                    value={formData.trucktype}
                    onChange={e => setFormData({...formData, trucktype: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="carreta">Carreta</option>
                    <option value="carreta 14,5m">Carreta 14,5m</option>
                    <option value="carreta 15m">Carreta 15m</option>
                    <option value="truck">Truck</option>
                    <option value="carreta baú">Carreta Baú</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vínculo</label>
                  <select 
                    value={formData.ownershiptype}
                    onChange={e => setFormData({...formData, ownershiptype: e.target.value as any})}
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
                Salvar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
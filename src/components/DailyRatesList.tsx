import React, { useState, useEffect } from 'react';
import { DailyRateRecord, FleetRecord, Client } from '../types';
import { Search, Plus, Clock, FileText, Paperclip, X, Save, Calendar, AlertCircle } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';
import { useInputHistory } from '../hooks/useInputHistory';

interface DailyRatesListProps {
  records: DailyRateRecord[];
  fleet: FleetRecord[];
  clients: Client[];
  onAddRecord: (record: Omit<DailyRateRecord, 'id'>) => void;
}

export const DailyRatesList: React.FC<DailyRatesListProps> = ({ records, fleet, clients, onAddRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<DailyRateRecord>>({
    clientName: '',
    driverName: '',
    truckPlate: '',
    trailerPlate: '',
    arrivalDateTime: '',
    departureDateTime: '',
    totalHours: 0,
    dailyRateQuantity: 0,
    delayReason: '',
    hasAttachment: false
  });

  const [delayReasonHistory, addDelayReason] = useInputHistory('delayReason');

  const calculateHours = (start: string, end: string) => {
      if (!start || !end) return 0;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate.getTime() - startDate.getTime();
      return Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
  };

  useEffect(() => {
    if (formData.arrivalDateTime && formData.departureDateTime) {
        const hours = calculateHours(formData.arrivalDateTime, formData.departureDateTime);
        setFormData(prev => ({...prev, totalHours: hours}));
    }
  }, [formData.arrivalDateTime, formData.departureDateTime]);

  const handleDriverChange = (driverName: string) => {
    const selectedFleetRecord = fleet.find(f => f.driverName === driverName);
    setFormData(prev => ({
      ...prev,
      driverName,
      truckPlate: selectedFleetRecord ? selectedFleetRecord.truckPlate : prev.truckPlate,
      trailerPlate: selectedFleetRecord ? selectedFleetRecord.trailerPlate : prev.trailerPlate
    }));
  };

  const handleSave = () => {
    if (!formData.clientName || !formData.driverName || !formData.arrivalDateTime) {
        alert("Preencha cliente, motorista e horário de chegada.");
        return;
    }

    if (formData.delayReason) {
      addDelayReason(formData.delayReason);
    }

    const newRecord: Omit<DailyRateRecord, 'id'> = {
        clientName: formData.clientName || '',
        driverName: formData.driverName || '',
        truckPlate: formData.truckPlate || '',
        trailerPlate: formData.trailerPlate || '',
        arrivalDateTime: formData.arrivalDateTime || '',
        departureDateTime: formData.departureDateTime || '',
        totalHours: formData.totalHours || 0,
        dailyRateQuantity: formData.dailyRateQuantity || 0,
        delayReason: formData.delayReason || '',
        hasAttachment: formData.hasAttachment || false
    };

    onAddRecord(newRecord);
    setIsModalOpen(false);
    setFormData({
        clientName: '',
        driverName: '',
        truckPlate: '',
        trailerPlate: '',
        arrivalDateTime: '',
        departureDateTime: '',
        totalHours: 0,
        dailyRateQuantity: 0,
        delayReason: '',
        hasAttachment: false
    });
  };

  const filteredRecords = records.filter(record => 
    record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.truckPlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Controle de Diárias</h2>
          <p className="text-sm text-slate-500">Monitore tempos de espera e custos adicionais</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cliente, motorista ou placa..." 
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
            <span className="hidden sm:inline">Nova Diária</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">ID / Cliente</th>
              <th className="px-6 py-4 border-b border-slate-200">Motorista / Placas</th>
              <th className="px-6 py-4 border-b border-slate-200">Chegada / Saída</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Horas</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Diárias</th>
              <th className="px-6 py-4 border-b border-slate-200">Motivo / Anexo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 align-top">
                  <div className="font-bold text-slate-900">{record.clientName}</div>
                  <div className="text-xs text-slate-500 mt-1">{record.id}</div>
                </td>
                <td className="px-6 py-4 align-top">
                   <div className="font-medium text-slate-900">{record.driverName}</div>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px] border border-slate-200">{record.truckPlate}</span>
                      <span className="text-slate-300">/</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px] border border-slate-200">{record.trailerPlate}</span>
                   </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <Clock size={12} />
                        <span>{new Date(record.arrivalDateTime).toLocaleString()}</span>
                    </div>
                    {record.departureDateTime ? (
                        <div className="flex items-center gap-2 text-red-500">
                            <Clock size={12} />
                            <span>{new Date(record.departureDateTime).toLocaleString()}</span>
                        </div>
                    ) : (
                        <span className="text-slate-400 italic pl-5">Em aberto</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-top text-center">
                    <span className="font-bold text-slate-700">{record.totalHours.toFixed(1)}h</span>
                </td>
                <td className="px-6 py-4 align-top text-center">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    record.dailyRateQuantity > 0 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {record.dailyRateQuantity}
                  </span>
                </td>
                <td className="px-6 py-4 align-top">
                    <div className="flex items-center justify-between">
                         <div className="max-w-[150px] truncate text-xs text-slate-600" title={record.delayReason}>
                            {record.delayReason || '-'}
                         </div>
                         {record.hasAttachment ? (
                             <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100" title="Ver Comprovante">
                                <Paperclip size={14} />
                             </div>
                         ) : (
                             <div className="p-1.5 text-slate-300">
                                <Paperclip size={14} />
                             </div>
                         )}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Lançamento de Diária</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Clients & Drivers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                    <select 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={formData.clientName}
                        onChange={e => setFormData({...formData, clientName: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {clients.map(c => <option key={c.id} value={c.companyName}>{c.companyName}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Motorista</label>
                    <select 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={formData.driverName}
                        onChange={e => handleDriverChange(e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        {fleet.map(f => <option key={f.id} value={f.driverName}>{f.driverName}</option>)}
                    </select>
                 </div>
              </div>

              {/* Plates (Auto-filled but editable) */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Placa Cavalo</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                        value={formData.truckPlate}
                        onChange={e => setFormData({...formData, truckPlate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Placa Carreta</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                        value={formData.trailerPlate}
                        onChange={e => setFormData({...formData, trailerPlate: e.target.value})}
                    />
                  </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data/Hora Chegada</label>
                    <input 
                        type="datetime-local" 
                        className="w-full p-2 border border-slate-200 rounded-lg"
                        value={formData.arrivalDateTime}
                        onChange={e => setFormData({...formData, arrivalDateTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data/Hora Saída</label>
                    <input 
                        type="datetime-local" 
                        className="w-full p-2 border border-slate-200 rounded-lg"
                        value={formData.departureDateTime}
                        onChange={e => setFormData({...formData, departureDateTime: e.target.value})}
                    />
                  </div>
              </div>

              {/* Calculations */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Horas Totais</p>
                      <p className="text-xl font-bold text-slate-800">{formData.totalHours?.toFixed(2)} h</p>
                  </div>
                  <div className="w-px h-10 bg-slate-200 mx-4"></div>
                  <div className="flex-1">
                      <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Qtde. Diárias</label>
                      <input 
                        type="number" 
                        className="w-20 p-1 border border-slate-300 rounded text-center font-bold text-slate-800"
                        value={formData.dailyRateQuantity}
                        onChange={e => setFormData({...formData, dailyRateQuantity: Number(e.target.value)})}
                      />
                  </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo do Atraso</label>
                <AutocompleteInput
                    value={formData.delayReason || ''}
                    onChange={value => setFormData({ ...formData, delayReason: value })}
                    suggestions={delayReasonHistory}
                    placeholder="Descreva o motivo..."
                />
              </div>

              {/* Attachment */}
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Comprovante de Entrega</label>
                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => setFormData({...formData, hasAttachment: !!e.target.files?.length})}
                    />
                    {formData.hasAttachment ? (
                        <div className="flex items-center gap-2 text-emerald-600">
                             <FileText size={24} />
                             <span className="font-medium">Arquivo Anexado</span>
                        </div>
                    ) : (
                        <>
                            <Paperclip size={24} className="mb-2" />
                            <span className="text-xs">Clique para anexar arquivo ou arraste aqui</span>
                        </>
                    )}
                 </div>
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
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
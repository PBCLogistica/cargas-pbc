import React, { useState } from 'react';
import { Load } from '../types';
import { Search, FileText, DollarSign, Truck, MapPin, Printer, Building2, User } from 'lucide-react';

interface BillingViewProps {
  loads: Load[];
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const BillingView: React.FC<BillingViewProps> = ({ loads }) => {
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLoads = loads.filter(load => 
    load.numeric_id.toString().includes(searchTerm) ||
    load.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.driver.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.numeric_id - a.numeric_id);

  const selectedLoad = loads.find(l => l.id === selectedLoadId);

  const grossProfit = selectedLoad 
    ? selectedLoad.companyvalue - selectedLoad.drivervalue - selectedLoad.toll - selectedLoad.advalorem 
    : 0;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Left Panel: Load List */}
      <div className="w-full lg:w-1/3 border-r border-slate-100 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por ID, cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredLoads.map(load => (
            <button 
              key={load.id} 
              onClick={() => setSelectedLoadId(load.id)}
              className={`w-full text-left p-4 border-b border-slate-100 transition-colors hover:bg-white ${selectedLoadId === load.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-800">Carga #{load.numeric_id}</span>
                <span className="text-xs text-slate-500">{new Date(load.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600 truncate">{load.client}</p>
              <p className="text-xs text-slate-400 truncate">{load.origin} → {load.destinations.join(', ')}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Billing Details */}
      <div className="w-full lg:w-2/3 p-6 overflow-y-auto">
        {selectedLoad ? (
          <div className="animate-fade-in">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="text-indigo-600" />
                  Fatura da Carga #{selectedLoad.numeric_id}
                </h2>
                <p className="text-sm text-slate-500">Detalhes financeiros e operacionais do frete.</p>
              </div>
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                <Printer size={16} />
                Imprimir
              </button>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700">Detalhes da Carga</h3>
                <dl className="text-sm space-y-2">
                  <div className="flex justify-between"><dt className="text-slate-500 flex items-center gap-2"><Building2 size={14}/>Cliente</dt><dd className="font-medium text-slate-800 text-right">{selectedLoad.client}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 flex items-center gap-2"><User size={14}/>Tomador</dt><dd className="font-medium text-slate-800 text-right">{selectedLoad.tomador || 'N/A'}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 flex items-center gap-2"><User size={14}/>Motorista</dt><dd className="font-medium text-slate-800 text-right">{selectedLoad.driver}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 flex items-center gap-2"><Truck size={14}/>Placas</dt><dd className="font-medium text-slate-800 text-right">{selectedLoad.truckplate} / {selectedLoad.trailerplate}</dd></div>
                </dl>
              </div>
               <div className="space-y-4">
                <h3 className="font-semibold text-slate-700">Rota</h3>
                <dl className="text-sm space-y-2">
                  <div className="flex justify-between"><dt className="text-slate-500 flex items-center gap-2"><MapPin size={14} className="text-indigo-500"/>Origem</dt><dd className="font-medium text-slate-800 text-right">{selectedLoad.origin}</dd></div>
                  
                  {selectedLoad.destinations.length > 1 ? (
                    <div>
                      <dt className="text-slate-500 flex items-center gap-2 mb-2"><MapPin size={14} className="text-red-500"/>Destinos e Valores</dt>
                      <dd className="font-medium text-slate-800 text-right space-y-2 pl-6">
                        {selectedLoad.destinations.map((dest, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-md border border-slate-100">
                            <div className="flex justify-between items-center font-bold text-slate-700">
                              <span>{dest}</span>
                              <span>{formatCurrency(selectedLoad.destination_values?.[index] || 0)}</span>
                            </div>
                            <div className="text-xs mt-2 space-y-1 text-slate-500">
                                <div className="flex justify-between"><span>Motorista:</span><span>{formatCurrency(selectedLoad.driver_values?.[index] || 0)}</span></div>
                                <div className="flex justify-between"><span>Pedágio:</span><span>{formatCurrency(selectedLoad.toll_values?.[index] || 0)}</span></div>
                                <div className="flex justify-between"><span>Ad Valorem:</span><span>{formatCurrency(selectedLoad.advalorem_values?.[index] || 0)}</span></div>
                            </div>
                          </div>
                        ))}
                      </dd>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <dt className="text-slate-500 flex items-center gap-2"><MapPin size={14} className="text-red-500"/>Destino</dt>
                      <dd className="font-medium text-slate-800 text-right">{selectedLoad.destinations[0]}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Financials Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-600"/>
                Composição de Valores Totais
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600">Valor Bruto (Empresa)</span><span className="font-medium text-slate-900">{formatCurrency(selectedLoad.companyvalue)}</span></div>
                <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-3"><span className="text-slate-600">(-) Custo Motorista</span><span className="font-medium text-red-600">-{formatCurrency(selectedLoad.drivervalue)}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600">(-) Pedágio</span><span className="font-medium text-red-600">-{formatCurrency(selectedLoad.toll)}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600">(-) Ad Valorem / GRIS</span><span className="font-medium text-red-600">-{formatCurrency(selectedLoad.advalorem)}</span></div>
                <div className="flex justify-between items-center text-sm font-bold border-t-2 border-slate-300 pt-3"><span className="text-slate-800">(=) Lucro Bruto</span><span className="text-emerald-700">{formatCurrency(grossProfit)}</span></div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                 <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-slate-800">Valor Final (Nota Fiscal)</p>
                        <div className="flex gap-4 text-xs text-slate-500 mt-1">
                            <span>ICMS: {selectedLoad.icms ? 'Incluso' : 'Não Incluso'}</span>
                            <span>PIS/COFINS: {selectedLoad.pisconfins ? 'Incluso' : 'Não Incluso'}</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(selectedLoad.finalvalue)}</p>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
            <FileText size={48} className="mb-4 opacity-20" />
            <h3 className="font-semibold text-lg text-slate-500">Selecione uma Carga</h3>
            <p className="text-sm">Escolha uma carga na lista ao lado para ver os detalhes do faturamento.</p>
          </div>
        )}
      </div>
    </div>
  );
};
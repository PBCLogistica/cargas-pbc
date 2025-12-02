import React, { useState } from 'react';
import { Client } from '../types';
import { Search, Plus, Building2, MapPin, CreditCard, Clock, Phone, X, Save, Trash2, Download } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onAddClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    companyName: '',
    productType: '',
    city: '',
    paymentType: 'Boleto',
    paymentTerm: '',
    contact: ''
  });

  const handleSave = () => {
    if (!formData.companyName || !formData.city) {
        alert("Preencha o nome da empresa e a cidade.");
        return;
    }
    
    const newClient: Client = {
      id: `CLI-${(clients.length + 1).toString().padStart(3, '0')}`,
      companyName: formData.companyName,
      productType: formData.productType || 'Geral',
      city: formData.city,
      paymentType: formData.paymentType as 'Boleto' | 'Depósito',
      paymentTerm: formData.paymentTerm || 'À vista',
      contact: formData.contact || 'N/A'
    };

    onAddClient(newClient);
    setIsModalOpen(false);
    setFormData({
      companyName: '',
      productType: '',
      city: '',
      paymentType: 'Boleto',
      paymentTerm: '',
      contact: ''
    });
  };

  const handleDelete = (id: string, companyName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${companyName}?`)) {
      onDeleteClient(id);
    }
  };

  const filteredClients = clients.filter(client => 
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.productType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (filteredClients.length === 0) {
      alert("Nenhum cliente para exportar.");
      return;
    }

    const headers = ['ID', 'Empresa', 'Tipo Produto', 'Cidade', 'Tipo Cobrança', 'Prazo Pagamento', 'Contato'];
    const csvRows = [
      headers.join(','),
      ...filteredClients.map(client => [
        `"${client.id}"`,
        `"${client.companyName}"`,
        `"${client.productType}"`,
        `"${client.city}"`,
        `"${client.paymentType}"`,
        `"${client.paymentTerm}"`,
        `"${client.contact}"`
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `export_clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Cadastro de Clientes</h2>
          <p className="text-sm text-slate-500">Gerencie informações comerciais e financeiras</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente ou cidade..." 
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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Empresa / ID</th>
              <th className="px-6 py-4 border-b border-slate-200">Tipo de Produto</th>
              <th className="px-6 py-4 border-b border-slate-200">Cidade</th>
              <th className="px-6 py-4 border-b border-slate-200">Cobrança</th>
              <th className="px-6 py-4 border-b border-slate-200">Contato</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{client.companyName}</div>
                      <div className="text-xs text-slate-400">ID: {client.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium">
                   {client.productType}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{client.city}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="space-y-1">
                       <div className="flex items-center gap-2">
                           <CreditCard size={14} className="text-indigo-400" />
                           <span className="text-slate-900 font-medium">{client.paymentType}</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                           <Clock size={12} />
                           <span>{client.paymentTerm}</span>
                       </div>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-slate-700">{client.contact}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleDelete(client.id, client.companyName)}
                    className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors" 
                    title="Excluir Cliente"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Building2 size={48} className="mb-4 opacity-20" />
            <p>Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Cadastrar Cliente</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ex: Indústria LTDA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Produto</label>
                  <input 
                    type="text" 
                    value={formData.productType}
                    onChange={e => setFormData({...formData, productType: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Eletrônicos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cidade / UF</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cobrança</label>
                  <select 
                    value={formData.paymentType}
                    onChange={e => setFormData({...formData, paymentType: e.target.value as any})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Boleto">Boleto</option>
                    <option value="Depósito">Depósito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prazo de Pagamento</label>
                  <input 
                    type="text" 
                    value={formData.paymentTerm}
                    onChange={e => setFormData({...formData, paymentTerm: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: 30 dias, À vista"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Informação de Contato</label>
                <input 
                  type="text" 
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: financeiro@empresa.com"
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
                Salvar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
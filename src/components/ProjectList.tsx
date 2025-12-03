import React, { useState } from 'react';
import { Project, ProjectStatus, Client } from '../types';
import { Search, Plus, X, Save, Trash2, Download, Pencil, Briefcase, DollarSign, Calendar, User, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useInputHistory } from '../hooks/useInputHistory';

interface ProjectListProps {
  projects: Project[];
  clients: Client[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const emptyForm: Partial<Project> = {
  projectName: '',
  clientName: '',
  scope: '',
  totalValue: 0,
  paymentTerms: '',
  startDate: new Date().toISOString().split('T')[0],
  deadline: '',
  status: ProjectStatus.PLANNING,
  responsible: '',
  notes: ''
};

export const ProjectList: React.FC<ProjectListProps> = ({ projects, clients, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [formData, setFormData] = useState<Partial<Project>>(emptyForm);

  const [paymentTermsHistory, addPaymentTerm] = useInputHistory('paymentTerm');
  const [responsibleHistory, addResponsible] = useInputHistory('responsible');

  const openModalForNew = () => {
    setEditingProject(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openModalForEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData(emptyForm);
  };

  const handleSave = () => {
    if (!formData.projectName || !formData.clientName || !formData.deadline) {
        alert("Preencha o nome do projeto, cliente e o prazo final.");
        return;
    }
    
    if (formData.paymentTerms) addPaymentTerm(formData.paymentTerms);
    if (formData.responsible) addResponsible(formData.responsible);

    if (editingProject) {
      onUpdateProject({ ...editingProject, ...formData });
    } else {
      const newProject: Project = {
        id: `PROJ-${(projects.length + 1).toString().padStart(3, '0')}`,
        ...emptyForm,
        ...formData
      } as Project;
      onAddProject(newProject);
    }
    closeModal();
  };

  const handleDelete = (id: string, projectName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o projeto "${projectName}"?`)) {
      onDeleteProject(id);
    }
  };

  const filteredProjects = projects.filter(project => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = project.projectName.toLowerCase().includes(term) ||
                          project.clientName.toLowerCase().includes(term) ||
                          project.responsible?.toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (filteredProjects.length === 0) {
      alert("Nenhum projeto para exportar.");
      return;
    }
    const dataToExport = filteredProjects.map(p => ({
      'ID': p.id,
      'Projeto': p.projectName,
      'Cliente': p.clientName,
      'Valor Total': p.totalValue,
      'Prazo': p.deadline,
      'Status': p.status,
      'Responsável': p.responsible,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projetos");
    XLSX.writeFile(workbook, `export_projetos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ProjectStatus.IN_PROGRESS: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case ProjectStatus.PLANNING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ProjectStatus.ON_HOLD: return 'bg-slate-100 text-slate-700 border-slate-200';
      case ProjectStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Gestão de Projetos e Contratos</h2>
          <p className="text-sm text-slate-500">Gerencie as diretrizes de projetos fechados</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar projeto ou cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full sm:w-52"
            />
          </div>
           <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'All')}
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="All">Todos os Status</option>
              {Object.values(ProjectStatus).map(status => (
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
            <span className="hidden sm:inline">Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Projeto / Cliente</th>
              <th className="px-6 py-4 border-b border-slate-200">Valor Total</th>
              <th className="px-6 py-4 border-b border-slate-200">Prazos</th>
              <th className="px-6 py-4 border-b border-slate-200">Responsável</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Status</th>
              <th className="px-6 py-4 border-b border-slate-200 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{project.projectName}</div>
                  <div className="text-xs text-slate-500">{project.clientName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <DollarSign size={14} className="text-emerald-500" />
                    {project.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500 w-12">Início:</span>
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500 w-12">Prazo:</span>
                      <span className="font-bold text-red-600">{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span>{project.responsible}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openModalForEdit(project)} className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg transition-colors" title="Editar Projeto">
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id, project.projectName)}
                      className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors" 
                      title="Excluir Projeto"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto</label>
                <input type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Ex: Operação Safra 2024" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-white">
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.companyName}>{c.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Escopo / Descrição</label>
                <textarea value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" rows={3} placeholder="Descreva os detalhes e diretrizes do projeto..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                  <input type="number" value={formData.totalValue} onChange={e => setFormData({...formData, totalValue: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Condições de Pagamento</label>
                  <input type="text" value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Ex: 30/60/90 dias" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prazo Final</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsável Interno</label>
                  <input type="text" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Nome do gestor" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})} className="w-full p-2 border border-slate-200 rounded-lg bg-white">
                    {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" rows={2} placeholder="Anotações importantes..."></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-sm"><Save size={18} /> Salvar Projeto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
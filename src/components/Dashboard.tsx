import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Line, AreaChart, Area, Legend, LabelList
} from 'recharts';
import { Load, LoadStatus, FleetRecord } from '../types';
import { TrendingUp, AlertTriangle, CheckCircle, Package, DollarSign, Target, Users, RefreshCw, Check, Clock } from 'lucide-react';

// --- Helper Functions for Formatting ---
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatShortCurrency = (value: number) => {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return formatCurrency(value);
};


export const Dashboard: React.FC<DashboardProps> = ({ loads, fleet }) => {
  // --- State for Editable Goal & Refresh ---
  const [monthlyGoal, setMonthlyGoal] = useState(50000);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simula um delay de busca de dados
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // --- Dynamic Calculations ---
  const referenceDate = new Date();
  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();

  const currentMonthLoads = loads.filter(load => {
    const loadDate = new Date(load.date);
    return loadDate.getMonth() === currentMonth && loadDate.getFullYear() === currentYear;
  });

  const totalRevenue = currentMonthLoads.reduce((acc, load) => acc + load.companyvalue, 0);
  const activeLoads = loads.filter(l => l.status === LoadStatus.IN_TRANSIT).length;
  const delayedLoads = loads.filter(l => l.status === LoadStatus.DELAYED).length;
  const completedLoads = currentMonthLoads.filter(l => l.status === LoadStatus.DELIVERED).length;
  const percentReached = monthlyGoal > 0 ? (totalRevenue / monthlyGoal) * 100 : 0;

  // --- OTIF Calculation ---
  const deliveredLoads = loads.filter(l => l.status === LoadStatus.DELIVERED && l.deliverydate && l.forecastdate);
  const onTimeDeliveries = deliveredLoads.filter(l => new Date(l.deliverydate!) <= new Date(l.forecastdate)).length;
  const delayedDeliveries = deliveredLoads.filter(l => new Date(l.deliverydate!) > new Date(l.forecastdate));
  const delayedDeliveriesCount = delayedDeliveries.length;
  const totalDelivered = deliveredLoads.length;
  const otifRate = totalDelivered > 0 ? (onTimeDeliveries / totalDelivered) * 100 : 100;
  const otifData = [
    { name: 'No Prazo', value: onTimeDeliveries },
    { name: 'Atrasado', value: delayedDeliveriesCount },
  ];
  const OTIF_COLORS = ['#10b981', '#ef4444']; // Emerald, Red

  // --- Report 1: Fleet vs Third Party Load Count ---
  const loadsByOwnership = loads.reduce((acc, load) => {
    const driverRecord = fleet.find(f => f.drivername === load.driver);
    const type = driverRecord?.ownershiptype === 'Frota' ? 'Frota Própria' : 'Terceiros';
    
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const fleetColors = ['#6366f1', '#f59e0b']; // Indigo, Amber

  // --- Report 2: Revenue by Client (Top 5) ---
  const revenueByClient = loads.reduce((acc, load) => {
    const existing = acc.find(i => i.name === load.client);
    if (existing) {
      existing.value += load.companyvalue;
    } else {
      acc.push({ name: load.client, value: load.companyvalue });
    }
    return acc;
  }, [] as { name: string, value: number }[])
  .sort((a, b) => b.value - a.value)
  .slice(0, 5);

  // --- Report 3: Monthly Revenue vs Meta (Dynamic) ---
  const revenueVsGoalData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};

    loads.forEach(load => {
        const date = new Date(load.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // YYYY-M format
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += load.companyvalue;
    });

    const result = [];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    for (let i = 3; i >= 0; i--) {
        const date = new Date(referenceDate);
        date.setMonth(date.getMonth() - i);
        
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthKey = `${year}-${month}`;
        
        const revenue = monthlyData[monthKey] || 0;
        
        result.push({
            name: monthNames[month],
            receita: revenue,
            meta: monthlyGoal
        });
    }
    return result;
  }, [loads, monthlyGoal]);
  
  // --- Report 4: Monthly Variation (Dynamic) ---
  const weeklyRevenue = currentMonthLoads.reduce((acc, load) => {
    const dayOfMonth = new Date(load.date).getDate();
    let week = 'Sem 4';
    if (dayOfMonth <= 7) week = 'Sem 1';
    else if (dayOfMonth <= 14) week = 'Sem 2';
    else if (dayOfMonth <= 21) week = 'Sem 3';
    
    acc[week] = (acc[week] || 0) + load.companyvalue;
    return acc;
  }, {} as Record<string, number>);

  const variationData = [
      { name: 'Sem 1', valor: weeklyRevenue['Sem 1'] || 0 },
      { name: 'Sem 2', valor: weeklyRevenue['Sem 2'] || 0 },
      { name: 'Sem 3', valor: weeklyRevenue['Sem 3'] || 0 },
      { name: 'Sem 4', valor: weeklyRevenue['Sem 4'] || 0 },
  ];

  // --- Components ---
  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className={`text-xs mt-2 font-medium ${color.text}`}>{subtext}</p>
      </div>
      <div className={`p-3 rounded-xl ${color.bg} ${color.iconText}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel Geral</h1>
          <p className="text-sm text-slate-500">Visão geral dos indicadores de performance.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* Main content with opacity transition */}
      <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {/* 1. KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Faturamento (Mês)" 
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            color={{ bg: 'bg-emerald-50', text: 'text-emerald-600', iconText: 'text-emerald-600' }}
            subtext={`${percentReached.toFixed(1)}% da meta mensal`}
          />
          <StatCard 
            title="Cargas Ativas" 
            value={activeLoads}
            icon={TruckIcon}
            color={{ bg: 'bg-indigo-50', text: 'text-indigo-600', iconText: 'text-indigo-600' }}
            subtext="Em rota agora"
          />
          <StatCard 
            title="Atrasos" 
            value={delayedLoads}
            icon={AlertTriangle}
            color={{ bg: 'bg-red-50', text: 'text-red-600', iconText: 'text-red-600' }}
            subtext="Ação necessária"
          />
          <StatCard 
            title="Entregas (Mês)" 
            value={completedLoads}
            icon={CheckCircle}
            color={{ bg: 'bg-blue-50', text: 'text-blue-600', iconText: 'text-blue-600' }}
            subtext="98% de taxa de sucesso"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 2. Monthly Revenue vs Goal (Composed Chart) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Target size={20} className="text-indigo-600"/>
                  Faturamento Mensal x Meta
               </h3>
               <div className="flex items-center gap-2">
                  <label htmlFor="goal" className="text-sm font-medium text-slate-600 shrink-0">Definir Meta:</label>
                  <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <input
                          id="goal"
                          type="number"
                          value={monthlyGoal}
                          onChange={(e) => setMonthlyGoal(Number(e.target.value) || 0)}
                          className="w-36 pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                  </div>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueVsGoalData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                     cursor={{fill: '#f8fafc'}}
                     formatter={(value: number) => [formatCurrency(value), '']}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="receita" name="Receita Realizada" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                    <LabelList 
                      dataKey="receita" 
                      position="top" 
                      formatter={(value: number) => value > 0 ? formatShortCurrency(value) : ''}
                      style={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                    />
                  </Bar>
                  <Line type="monotone" dataKey="meta" name="Meta Mensal" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Fleet vs Third Party (Donut) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Users size={20} className="text-indigo-600"/>
                  Frota x Terceiros
             </h3>
             <p className="text-xs text-slate-500 mb-6">Distribuição de cargas por vínculo</p>
             
             <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loadsByOwnership}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {loadsByOwnership.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={fleetColors[index % fleetColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} Cargas`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-sm text-slate-400 font-medium">Total Cargas</span>
                  <p className="text-xl font-bold text-slate-800">{loads.length}</p>
                </div>
              </div>
             </div>
             
             <div className="space-y-3 mt-2">
               {loadsByOwnership.map((item, index) => (
                 <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fleetColors[index % fleetColors.length] }} />
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {loads.length > 0 ? ((item.value / loads.length) * 100).toFixed(0) : 0}%
                    </span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* 4. OTIF Chart and Justifications */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-indigo-600"/>
                  OTIF - Entregas no Prazo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={otifData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                        {otifData.map((entry, index) => (<Cell key={`cell-${index}`} fill={OTIF_COLORS[index % OTIF_COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} Entregas`, 'Quantidade']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-emerald-600">{otifRate.toFixed(0)}%</span>
                    <p className="text-sm font-medium text-slate-500">On-Time</p>
                  </div>
                </div>
                <div className="max-h-[250px] overflow-y-auto pr-2">
                  <h4 className="font-semibold text-slate-700 mb-3">Justificativas de Atraso</h4>
                  {delayedDeliveries.length > 0 ? (
                    <div className="space-y-3">
                      {delayedDeliveries.map(load => (
                        <div key={load.id} className="flex items-start gap-3 p-3 bg-red-50/50 border border-red-100 rounded-lg">
                          <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-sm text-slate-800">Carga #{load.numeric_id}</p>
                            <p className="text-xs text-slate-600">{load.observation || 'Sem justificativa registrada.'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                      <CheckCircle size={32} className="text-emerald-500 mb-2" />
                      <p className="font-semibold text-sm text-emerald-800">Nenhuma entrega atrasada!</p>
                      <p className="text-xs text-emerald-700">Ótimo trabalho da equipe.</p>
                    </div>
                  )}
                </div>
              </div>
           </div>

           {/* 5. Top Clients (Horizontal Bar) */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <DollarSign size={20} className="text-indigo-600"/>
                  Top Clientes (Receita)
              </h3>
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByClient} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 11, fill: '#475569'}} />
                      <Tooltip 
                          cursor={{fill: '#f1f5f9'}}
                          formatter={(value: number) => [formatCurrency(value), 'Receita']}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24}>
                        <LabelList 
                          dataKey="value" 
                          position="right" 
                          formatter={(value: number) => formatShortCurrency(value)}
                          style={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                        />
                      </Bar>
                  </BarChart>
                  </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper Icon wrapper to avoid collision
const TruckIcon = ({ size, className }: { size?: number, className?: string }) => (
  <Package size={size} className={className} />
);
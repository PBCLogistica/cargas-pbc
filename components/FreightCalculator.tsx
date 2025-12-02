import React, { useState } from 'react';
import { Calculator, DollarSign, Truck, Info, RefreshCw, Briefcase, MapPin, Navigation, Search } from 'lucide-react';

// Simplified Coefficients based on ANTT methodology (Mock Data for Demo)
// CCD: Cost of Displacement (R$/km)
// CC: Cost of Loading/Unloading (R$)
const ANTT_COEFFICIENTS: Record<string, Record<string, { ccd: number, cc: number }>> = {
  'general': {
    '2': { ccd: 3.50, cc: 280.00 }, // Toco
    '3': { ccd: 4.20, cc: 350.00 }, // Truck
    '4': { ccd: 5.10, cc: 420.00 }, // Bitruck
    '5': { ccd: 5.80, cc: 500.00 }, // Carreta 2 eixos
    '6': { ccd: 6.50, cc: 580.00 }, // Carreta 3 eixos
    '7': { ccd: 7.20, cc: 650.00 }, // Bitrem
    '9': { ccd: 8.50, cc: 750.00 }, // Rodotrem
  },
  'bulk': {
    '2': { ccd: 3.60, cc: 290.00 },
    '3': { ccd: 4.40, cc: 360.00 },
    '4': { ccd: 5.30, cc: 430.00 },
    '5': { ccd: 6.00, cc: 510.00 },
    '6': { ccd: 6.80, cc: 600.00 },
    '7': { ccd: 7.50, cc: 680.00 },
    '9': { ccd: 8.80, cc: 780.00 },
  },
  'frigo': {
    '2': { ccd: 4.10, cc: 320.00 },
    '3': { ccd: 4.90, cc: 400.00 },
    '4': { ccd: 5.90, cc: 480.00 },
    '5': { ccd: 6.80, cc: 560.00 },
    '6': { ccd: 7.60, cc: 650.00 },
    '7': { ccd: 8.40, cc: 720.00 },
    '9': { ccd: 9.80, cc: 850.00 },
  },
  'dangerous': {
    '2': { ccd: 4.50, cc: 350.00 },
    '3': { ccd: 5.40, cc: 450.00 },
    '4': { ccd: 6.50, cc: 520.00 },
    '5': { ccd: 7.40, cc: 600.00 },
    '6': { ccd: 8.30, cc: 700.00 },
    '7': { ccd: 9.20, cc: 800.00 },
    '9': { ccd: 10.50, cc: 950.00 },
  }
};

export const FreightCalculator: React.FC = () => {
  // Route State
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [mapUrl, setMapUrl] = useState<string>('');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Calc State
  const [distance, setDistance] = useState<string>('');
  const [cargoType, setCargoType] = useState<string>('general');
  const [axles, setAxles] = useState<string>('6'); // Default to Carreta 3 eixos
  const [profitMargin, setProfitMargin] = useState<string>('20');
  const [tollCost, setTollCost] = useState<string>('0');
  const [result, setResult] = useState<{ floor: number, total: number, profit: number } | null>(null);

  const calculateFreight = () => {
    const dist = parseFloat(distance);
    const toll = parseFloat(tollCost) || 0;
    const margin = parseFloat(profitMargin) || 0;
    
    if (!dist || dist <= 0) {
      // Don't clear result here to allow error state or just do nothing
      // But we can clear it if invalid
      if (!result) setResult(null); 
      return;
    }

    const coef = ANTT_COEFFICIENTS[cargoType][axles];
    
    // ANTT Formula Logic: (CCD * Distance) + CC
    const displacementCost = coef.ccd * dist;
    const loadingCost = coef.cc;
    const floorPrice = displacementCost + loadingCost;
    
    // Add User specific costs and margins
    const profitValue = floorPrice * (margin / 100);
    const totalFreight = floorPrice + profitValue + toll;

    setResult({
      floor: floorPrice,
      profit: profitValue,
      total: totalFreight
    });
  };

  const handleRouteSearch = () => {
    if (!origin || !destination) return;

    setIsCalculatingRoute(true);
    setResult(null); // Clear previous result when new route is traced
    
    // 1. Update Map Iframe to show route
    const query = `from: ${origin} to: ${destination}`;
    setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=6&output=embed`);

    // 2. Simulate API Distance calculation (Mock)
    // In a real production app, this would use Google Distance Matrix API
    setTimeout(() => {
        const mockDistance = Math.floor(Math.random() * (1200 - 150) + 150); // Random distance between 150km and 1200km
        setDistance(mockDistance.toString());
        setIsCalculatingRoute(false);
    }, 1000);
  };

  const handleClear = () => {
    setDistance('');
    setOrigin('');
    setDestination('');
    setMapUrl('');
    setTollCost('0');
    setResult(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="text-indigo-600" />
            Calculadora de Frete Mínimo
          </h2>
          <p className="text-sm text-slate-500">Planejamento de rotas e cálculo oficial ANTT</p>
        </div>
        <button 
          onClick={handleClear}
          className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-slate-200 transition-colors"
          title="Limpar campos"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        
        {/* Left Column: Inputs & Map */}
        <div className="w-full lg:w-1/2 p-0 flex flex-col border-r border-slate-100">
           
           {/* Route Inputs */}
           <div className="p-6 border-b border-slate-100 bg-white z-10">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Navigation size={18} className="text-slate-400" />
                Definir Rota
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input 
                        type="text" 
                        placeholder="Origem (Ex: São Paulo, SP)"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full pl-9 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                    <input 
                        type="text" 
                        placeholder="Destino (Ex: Rio de Janeiro, RJ)"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full pl-9 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
             </div>
             <button 
                onClick={handleRouteSearch}
                disabled={!origin || !destination || isCalculatingRoute}
                className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all
                    ${!origin || !destination 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}
                `}
             >
                {isCalculatingRoute ? (
                    <>Simulando Rota...</>
                ) : (
                    <><Search size={16} /> Traçar Rota no Mapa</>
                )}
             </button>
           </div>

           {/* Map Visualization */}
           <div className="flex-1 bg-slate-100 relative min-h-[300px]">
             {mapUrl ? (
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    src={mapUrl}
                    className="w-full h-full"
                    title="Route Map"
                ></iframe>
             ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <MapPin size={48} className="mb-2 opacity-20" />
                    <p className="text-sm">Preencha origem e destino para visualizar</p>
                </div>
             )}
             
             {/* Distance Overlay */}
             {distance && (
                 <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Distância Calculada</p>
                        <p className="text-lg font-bold text-slate-800">{distance} km</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">
                        Rota Sugerida
                    </div>
                 </div>
             )}
           </div>
        </div>

        {/* Right Column: Parameters & Results */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto bg-slate-50">
           <div className="space-y-6">
              
              {/* Parameters Form */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Truck size={18} className="text-slate-400" />
                    Configuração do Veículo
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Distância (Manual ou Automática)</label>
                        <div className="relative">
                        <input 
                            type="number" 
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                            placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">km</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Carga</label>
                            <select 
                            value={cargoType}
                            onChange={(e) => setCargoType(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                            <option value="general">Carga Geral</option>
                            <option value="bulk">Granel Sólido</option>
                            <option value="frigo">Frigorificada</option>
                            <option value="dangerous">Perigosa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Eixos / Veículo</label>
                            <select 
                            value={axles}
                            onChange={(e) => setAxles(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                            <option value="2">2 Eixos (Toco)</option>
                            <option value="3">3 Eixos (Truck)</option>
                            <option value="4">4 Eixos (Bitruck)</option>
                            <option value="5">5 Eixos (Carreta)</option>
                            <option value="6">6 Eixos (Carreta LS)</option>
                            <option value="7">7 Eixos (Bitrem)</option>
                            <option value="9">9 Eixos (Rodotrem)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Pedágio (R$)</label>
                            <input 
                            type="number" 
                            value={tollCost}
                            onChange={(e) => setTollCost(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Margem (%)</label>
                            <input 
                            type="number" 
                            value={profitMargin}
                            onChange={(e) => setProfitMargin(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={calculateFreight}
                        disabled={!distance}
                        className={`w-full mt-4 py-3 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all
                            ${!distance 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'}
                        `}
                    >
                        <Calculator size={20} />
                        Calcular Valor do Frete
                    </button>
                  </div>
              </div>

              {/* Result Card */}
              {result && (
                <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-end justify-between mb-2">
                            <p className="text-sm font-bold text-slate-500 uppercase">Valor do Frete</p>
                            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">ANTT + Margem</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-800 flex items-center gap-1 mb-1">
                            <span className="text-2xl mt-1 text-slate-400">R$</span>
                            {result.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-sm text-slate-500 border-b border-slate-100 pb-4 mb-4">
                            R$ {(result.total / parseFloat(distance)).toFixed(2)} / km
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 mb-1">Piso Mínimo</p>
                                <p className="font-bold text-slate-700">R$ {result.floor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 mb-1">Lucro Estimado</p>
                                <p className="font-bold text-emerald-600">+ R$ {result.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                </div>
              )}
              
              {!result && (
                  <div className="text-center py-6 text-slate-400 bg-slate-100/50 rounded-xl border border-slate-200 border-dashed">
                    <p className="text-sm">Defina a rota e clique em calcular.</p>
                  </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                 <Info className="text-blue-500 flex-shrink-0" size={20} />
                 <p className="text-xs text-blue-700 leading-relaxed">
                   <strong>Nota:</strong> Este sistema utiliza uma simulação de distância baseada no Maps para demonstração. Em produção, conecte à API Google Distance Matrix para precisão exata de quilometragem e pedágios.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
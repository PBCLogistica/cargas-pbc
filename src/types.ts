export enum LoadStatus {
  PENDING = 'Pendente',
  IN_TRANSIT = 'Em Trânsito',
  DELIVERED = 'Entregue',
  DELAYED = 'Atrasado',
  CANCELLED = 'Cancelado'
}

export interface Load {
  id: string;
  // General Info
  date: string; // Data emissão
  client: string;
  origin: string;
  destination: string;
  
  // Transport Info
  driver: string;
  vehicleType: string;
  truckPlate: string;
  trailerPlate: string;
  weight: number; // Capacidade in kg
  
  // Dates
  forecastDate: string;
  deliveryDate?: string;
  
  // Financials
  companyValue: number; // Valor empresa
  driverValue: number;  // Valor motorista
  finalValue: number;   // Valor final
  toll: number;        // Pedágio
  adValorem: number;   // Advaloren
  
  // Taxes
  icms: boolean;
  pisConfins: boolean;
  
  // Meta
  status: LoadStatus;
  observation: string;
}

export interface FleetRecord {
  id: string;
  driverName: string;
  truckPlate: string;
  trailerPlate: string;
  truckType: string;
  ownershipType: 'Frota' | 'Terceiro';
  capacity: number; // in kg
}

export interface Client {
  id: string;
  companyName: string;
  productType: string;
  city: string;
  paymentType: 'Boleto' | 'Depósito';
  paymentTerm: string; // e.g. "30 dias"
  contact: string;
}

export interface DailyRateRecord {
  id: string;
  clientName: string;
  driverName: string;
  truckPlate: string;
  trailerPlate: string;
  arrivalDateTime: string; // ISO String
  departureDateTime: string; // ISO String
  totalHours: number;
  dailyRateQuantity: number;
  delayReason: string;
  hasAttachment: boolean;
}

export interface TrackingUpdate {
  id: string;
  loadId: string;
  timestamp: string;
  location: string;
  status: string;
  distanceToDelivery: number; // km
  notes?: string;
  hasAttachment?: boolean;
}

export interface DashboardStats {
  totalLoads: number;
  activeLoads: number;
  revenue: number;
  delayed: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ViewState = 'dashboard' | 'loads' | 'fleet' | 'clients' | 'daily_rates' | 'tracking' | 'calculator' | 'assistant' | 'settings';
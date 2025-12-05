export enum LoadStatus {
  PENDING = 'Pendente',
  LOADING = 'Carregando',
  IN_TRANSIT = 'Em Trânsito',
  DELIVERED = 'Entregue',
  DELAYED = 'Atrasado',
  CANCELLED = 'Cancelado'
}

export interface Load {
  id: string;
  numeric_id: number;
  date: string;
  client: string;
  origin: string;
  destinations: string[];
  destination_values: number[]; // Novo campo
  driver: string;
  vehicletype: string;
  truckplate: string;
  trailerplate: string;
  weight: number;
  forecastdate: string;
  deliverydate?: string;
  companyvalue: number;
  drivervalue: number;
  finalvalue: number;
  toll: number;
  advalorem: number;
  icms: boolean;
  pisconfins: boolean;
  status: LoadStatus;
  observation: string;
  tomador?: string;
  updated_by?: string;
}

export interface FleetRecord {
  id: string;
  drivername: string;
  truckplate: string;
  trailerplate: string;
  trucktype: string;
  ownershiptype: 'Frota' | 'Terceiro';
  capacity: number;
  phone?: string;
  updated_by?: string;
}

export interface Client {
  id: string;
  companyname: string;
  producttype: string;
  city: string;
  paymenttype: 'Boleto' | 'Depósito';
  paymentterm: string;
  contact: string;
  updated_by?: string;
}

export interface DailyRateRecord {
  id: string;
  clientname: string;
  drivername: string;
  truckplate: string;
  trailerplate: string;
  arrivaldatetime: string;
  departuredatetime: string;
  totalhours: number;
  dailyratequantity: number;
  dailyratevalue: number;
  totalvalue: number;
  delayreason: string;
  hasattachment: boolean;
  updated_by?: string;
}

export interface TrackingUpdate {
  id: string;
  loadid: string;
  timestamp: string;
  location: string;
  status: string;
  distancetodelivery: number;
  notes?: string;
  hasattachment?: boolean;
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

export enum ProjectStatus {
  PLANNING = 'Planejamento',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  ON_HOLD = 'Em Espera',
  CANCELLED = 'Cancelado'
}

export interface Project {
  id: string;
  projectname: string;
  clientname: string;
  scope: string;
  totalvalue: number;
  valueperload: number;
  loadquantity: number;
  paymentterms: string;
  startdate: string;
  deadline: string;
  status: ProjectStatus;
  responsible: string;
  notes?: string;
  updated_by?: string;
}

export type ViewState = 'dashboard' | 'loads' | 'projects' | 'fleet' | 'clients' | 'daily_rates' | 'tracking' | 'calculator' | 'assistant' | 'settings' | 'billing';
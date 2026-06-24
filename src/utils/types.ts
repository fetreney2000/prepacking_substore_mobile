export interface AppSettings {
  id?: number;
  minWeeks: number;
  bufferWeeks: number;
  maxWeeks: number;
  defaultFilename: string;
  appTitle: string;
  layoutMode: 'table' | 'card';
}

export interface Group {
  id: number;
  name: string;
  notes: string;
}

export interface SKU {
  id: number;
  kod: string;
  nama: string;
  saizPek: number;
  groupId: number | null;
  enabled: boolean;
  fullStockAlways: boolean;
  notes: string;
  stokSemasa: number;
  usageMonth1: number;
  usageMonth2: number;
  usageMonth3: number;
  useManualLevels: boolean;
  minManual: number;
  penimbalManual: number;
  maksManual: number;
}

export interface Order {
  id: number;
  tarikh: string;
  namaPembuat: string;
  tempohMinggu: number;
  notes: string;
  itemCount?: number;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  skuId: number | null;
  kod: string;
  qtyOrdered: number;
  notes: string;
}

export interface InventoryLevels {
  awu: number;
  min: number;
  penimbal: number;
  maks: number;
}

export type StockStatus = 'ok' | 'low' | 'critical' | 'out' | 'disabled';

export interface ExportData {
  settings: AppSettings[];
  groups: Group[];
  skus: SKU[];
  orders: Order[];
  orderItems: OrderItem[];
  exportedAt: string;
  version: number;
}

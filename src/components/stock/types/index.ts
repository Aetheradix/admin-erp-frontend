export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  inStock: number;
  minStock: number;
  maxStock: number;
  level: 'good' | 'low' | 'critical' | 'out';
}

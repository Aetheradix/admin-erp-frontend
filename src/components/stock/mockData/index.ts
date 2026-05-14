import { StockItem } from '../types';

export const mockStockData: StockItem[] = [
  { id: '1', name: 'MacBook Pro 16"', sku: 'MBP-16-2026', category: 'Electronics', inStock: 24, minStock: 5, maxStock: 50, level: 'good' },
  { id: '2', name: 'Dell Monitor 27"', sku: 'DLM-27-4K', category: 'Electronics', inStock: 45, minStock: 10, maxStock: 60, level: 'good' },
  { id: '3', name: 'Ergonomic Chair', sku: 'ERG-CH-PRO', category: 'Furniture', inStock: 8, minStock: 10, maxStock: 30, level: 'low' },
  { id: '4', name: 'Standing Desk', sku: 'STD-DSK-EL', category: 'Furniture', inStock: 3, minStock: 5, maxStock: 20, level: 'critical' },
  { id: '5', name: 'Wireless Keyboard', sku: 'WK-LOG-MX', category: 'Peripherals', inStock: 67, minStock: 15, maxStock: 80, level: 'good' },
  { id: '6', name: 'USB-C Hub', sku: 'USB-HUB-7P', category: 'Peripherals', inStock: 0, minStock: 10, maxStock: 40, level: 'out' },
  { id: '7', name: 'Noise-Cancel Headphones', sku: 'NCH-SONY-5', category: 'Audio', inStock: 15, minStock: 5, maxStock: 25, level: 'good' },
];

export const levelConfig: Record<string, { color: string; tag: string; tagColor: string }> = {
  good: { color: '#059669', tag: 'In Stock', tagColor: 'green' },
  low: { color: '#d97706', tag: 'Low Stock', tagColor: 'gold' },
  critical: { color: '#e11d48', tag: 'Critical', tagColor: 'red' },
  out: { color: '#6b635e', tag: 'Out of Stock', tagColor: 'default' },
};

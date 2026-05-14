import { InventoryItem } from '../types';

export const mockItems: InventoryItem[] = [
  { id: 'ITM-001', name: 'MacBook Pro 16"', category: 'Electronics', sku: 'MBP-16-2026', quantity: 24, price: '$2,499', status: 'active' },
  { id: 'ITM-002', name: 'Dell Monitor 27"', category: 'Electronics', sku: 'DLM-27-4K', quantity: 45, price: '$449', status: 'active' },
  { id: 'ITM-003', name: 'Ergonomic Chair', category: 'Furniture', sku: 'ERG-CH-PRO', quantity: 8, price: '$599', status: 'active' },
  { id: 'ITM-004', name: 'Standing Desk', category: 'Furniture', sku: 'STD-DSK-EL', quantity: 3, price: '$749', status: 'inactive' },
  { id: 'ITM-005', name: 'Wireless Keyboard', category: 'Peripherals', sku: 'WK-LOG-MX', quantity: 67, price: '$99', status: 'active' },
  { id: 'ITM-006', name: 'USB-C Hub', category: 'Peripherals', sku: 'USB-HUB-7P', quantity: 0, price: '$79', status: 'inactive' },
  { id: 'ITM-007', name: 'Noise-Cancel Headphones', category: 'Audio', sku: 'NCH-SONY-5', quantity: 15, price: '$349', status: 'active' },
];

export const catColors: Record<string, string> = { 
  Electronics: 'blue', 
  Furniture: 'green', 
  Peripherals: 'purple', 
  Audio: 'cyan' 
};

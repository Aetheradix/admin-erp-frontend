import { StockMovement } from '../types';

export const mockMovements: StockMovement[] = [
  { id: '1', item: 'MacBook Pro 16"', sku: 'MBP-16-2026', type: 'IN', quantity: 10, date: '2026-05-10', reference: 'PO-2026-042', by: 'John Doe', location: 'Warehouse A' },
  { id: '2', item: 'MacBook Pro 16"', sku: 'MBP-16-2026', type: 'OUT', quantity: 3, date: '2026-05-08', reference: 'REQ-2026-118', by: 'Sarah Chen', location: 'Office SF' },
  { id: '3', item: 'Dell Monitor 27"', sku: 'DLM-27-4K', type: 'IN', quantity: 20, date: '2026-05-07', reference: 'PO-2026-041', by: 'John Doe', location: 'Warehouse A' },
  { id: '4', item: 'Ergonomic Chair', sku: 'ERG-CH-PRO', type: 'OUT', quantity: 5, date: '2026-05-06', reference: 'REQ-2026-116', by: 'Emily Watson', location: 'Office NY' },
  { id: '5', item: 'Wireless Keyboard', sku: 'WK-LOG-MX', type: 'IN', quantity: 30, date: '2026-05-05', reference: 'PO-2026-040', by: 'John Doe', location: 'Warehouse B' },
  { id: '6', item: 'Standing Desk', sku: 'STD-DSK-EL', type: 'OUT', quantity: 2, date: '2026-05-04', reference: 'REQ-2026-114', by: 'Mike Ross', location: 'Office SF' },
  { id: '7', item: 'Noise-Cancel Headphones', sku: 'NCH-SONY-5', type: 'IN', quantity: 15, date: '2026-05-03', reference: 'PO-2026-039', by: 'John Doe', location: 'Warehouse A' },
  { id: '8', item: 'USB-C Hub', sku: 'USB-HUB-7P', type: 'OUT', quantity: 10, date: '2026-05-01', reference: 'REQ-2026-112', by: 'Tom Baker', location: 'Office SF' },
];

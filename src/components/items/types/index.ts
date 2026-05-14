export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  price: string;
  status: 'active' | 'inactive';
}

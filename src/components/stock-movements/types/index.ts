export interface StockMovement {
  id: string;
  item: string;
  sku: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  reference: string;
  by: string;
  location: string;
}

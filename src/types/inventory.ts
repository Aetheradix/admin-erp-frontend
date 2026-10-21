export type InventoryCondition = 'New' | 'Good' | 'Fair' | 'Poor';
export type InventoryStatus = 'Available' | 'Booked' | 'Assigned' | 'Under Maintenance' | 'Retired';

export interface InventoryItem {
  id: number;
  name: string;
  asset_id: string;
  category: string;
  description?: string | null;
  brand_model?: string | null;
  serial_number?: string | null;
  quantity: number;
  location?: string | null;
  purchase_date?: string | null;
  purchase_cost: number;
  currency?: string | null;
  condition_status: InventoryCondition;
  image_url?: string | null;
  assigned_to?: number | null;
  assigned_date?: string | null;
  status: InventoryStatus;
  is_bookable: number | boolean;
  resource_id?: number | null;
  notes?: string | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;

  // Joined fields
  assigned_user_name?: string | null;
  assigned_user_email?: string | null;
  assigned_user_department?: string | null;
  assigned_user_avatar?: string | null;
  resource_name?: string | null;
  resource_is_active?: number | boolean | null;
  active_bookings_count?: number;
}

export interface InventoryAuditLog {
  id: number;
  item_id: number;
  action: string;
  user_id?: number | null;
  user_name?: string | null;
  details?: string | null;
  previous_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  created_at: string;
  item_name?: string;
  asset_id?: string;
}

export interface InventoryBookingRecord {
  id: number;
  resource_id: number;
  booked_by: number;
  booked_by_name?: string;
  booked_by_email?: string;
  start_datetime: string;
  end_datetime: string;
  purpose?: string | null;
  notes?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';
  created_at?: string;
}

export interface InventoryStats {
  totalItems: number;
  availableItems: number;
  bookedItems: number;
  assignedItems: number;
  maintenanceItems: number;
  retiredItems: number;
  bookableItems: number;
  totalValuation: number;
  totalQuantity: number;
  utilizationRate: number;
  categoryBreakdown: { category: string; count: number; value: string | number }[];
  conditionBreakdown: { condition_status: InventoryCondition; count: number }[];
  recentAudits: InventoryAuditLog[];
}

export interface InventoryFilterOptions {
  categories: string[];
  locations: string[];
  statuses: string[];
  conditions: string[];
}

export interface AssignableEmployee {
  id: number;
  username: string;
  email: string;
  department?: string | null;
  designation?: string | null;
  image_url?: string | null;
}

export interface InventoryQueryParams {
  search?: string;
  category?: string;
  status?: string;
  is_bookable?: boolean | string | number;
  assigned_to?: string | number;
  location?: string;
  condition_status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

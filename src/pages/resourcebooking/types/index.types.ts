
export type ResourceType = 'Room' | 'Equipment' | 'Vehicle' | 'Other';

export type ResourceStatus = 'Active' | 'Inactive';

export interface Resource {
  id: number;

  name: string;

  type: ResourceType;

  description?: string | null;

  location?: string | null;

  capacity?: number | null;

  status: ResourceStatus;

  image_url?: string | null;

  created_at?: string;

  updated_at?: string;
}

export type ResourceBookingStatus =
  'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'Completed';

export interface ResourceBooking {
  id: number;

  resource_id: number;

  user_id: number;

  start_datetime: string;

  end_datetime: string;

  purpose?: string | null;

  notes?: string | null;

  status: ResourceBookingStatus;

  approved_by?: number | null;

  approved_at?: string | null;

  created_at?: string;

  updated_at?: string;

  // Joined resource information
  resource_name?: string;

  resource_type?: ResourceType;

  resource_location?: string | null;

  // Joined user information
  username?: string;

  email?: string;
}


export interface CreateResourceBookingRequest {
  resource_id: number;

  start_datetime: string;

  end_datetime: string;

  purpose?: string;

  notes?: string;
}


export interface UpdateResourceBookingStatusRequest {
  id: number;

  status: ResourceBookingStatus;

  admin_comment?: string;
}

export interface CheckResourceAvailabilityRequest {
  resource_id: number;

  start_datetime: string;

  end_datetime: string;
}


export interface ResourceAvailability {
  available: boolean;

  resource_id?: number;

  start_datetime?: string;

  end_datetime?: string;

  message?: string;

  conflicting_booking?: ResourceBooking | null;
}

export interface ResourceBookingResponse {
  success: boolean;

  message: string;

  data?: ResourceBooking;
}


export interface ResourcesResponse {
  success: boolean;

  message?: string;

  data: Resource[];
}


export interface ResourceBookingsResponse {
  success: boolean;

  message?: string;

  data: ResourceBooking[];
}


export interface ResourceBookingStats {
  total: number;

  pending: number;

  confirmed: number;

  rejected: number;

  cancelled: number;

  completed: number;
}

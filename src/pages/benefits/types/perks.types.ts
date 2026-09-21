export type PerkStatus = 'Active' | 'Inactive';
export type PerkTypeStatus = 'Active' | 'Inactive';
export type PerkValueType = 'fixed' | 'percentage';

export interface PerkType {
  id: number;
  name: string;
  description: string | null;
  is_active?: boolean;
  status?: PerkTypeStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Perk {
  id: number;
  perk_type_id?: number;
  perk_type?: string;
  title?: string;
  name?: string;
  description?: string | null;

  // Value, Amount & Currency fields
  value?: number | string | null;
  value_type?: PerkValueType | string | null;
  currency?: string | null;
  value_limit?: number | null;
  amount?: number | null;

  // Usage, Limits & Validity
  usage_limit?: number | string | null;
  usage_period?: string | null;
  frequency?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;

  // Metadata & Eligibility
  eligibility?: unknown;
  configuration?: unknown;
  icon?: string | null;
  assigned?: number | null;

  // Status flags
  is_active?: boolean;
  status?: PerkStatus;

  created_at?: string;
  updated_at?: string;
}

export interface UserPerk {
  id: number;
  user_id: number;
  perk_id: number;

  valid_from?: string | null;
  valid_until?: string | null;
  status?: 'Active' | 'Expired' | 'Inactive';

  used_value?: number | null;
  remaining_value?: number | null;
  usage_count?: number | null;

  // Embedded perk details returned by JOIN queries
  title?: string;
  name?: string;
  description?: string | null;
  value?: number | string | null;
  value_type?: PerkValueType | string | null;
  currency?: string | null;
  usage_limit?: number | string | null;
  usage_period?: string | null;
  perk_type_id?: number;
  perk_type?: string;

  created_at?: string;
  updated_at?: string;

  [key: string]: unknown;
}

/* =========================================================
   REQUEST & RESPONSE INTERFACES
========================================================= */

export interface CreatePerkRequest {
  [key: string]: unknown;
}

export interface UpdatePerkRequest {
  id: number;
  data: {
    [key: string]: unknown;
  };
}

export interface CreatePerkTypeRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePerkTypeRequest {
  id: number;
  data: {
    name?: string;
    description?: string;
    is_active?: boolean;
  };
}

export interface AssignPerkRequest {
  perkId: number;
  user_id: number;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface UpdateUserPerkRequest {
  id: number;
  data: {
    [key: string]: unknown;
  };
}

export interface PerkMutationResponse {
  success: boolean;
  message: string;
  data: Perk;
}

export interface PerkTypeMutationResponse {
  success: boolean;
  message: string;
  data: PerkType;
}

export interface UserPerkMutationResponse {
  success: boolean;
  message: string;
  data: UserPerk;
}

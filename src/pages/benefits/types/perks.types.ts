export type PerkStatus = 'Active' | 'Inactive';

export type PerkTypeStatus = 'Active' | 'Inactive';

export interface PerkType {
  id: number;
  name: string;
  description: string | null;
  status: PerkTypeStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Perk {
  id: number;
  perk_type_id: number;
  title: string;
  description: string | null;

  // Keep these generic because new perk types
  // should not require database/schema changes.
  value: string | null;
  value_limit: number | null;

  eligibility: string | null;
  frequency: string | null;

  status: PerkStatus;

  created_at?: string;
  updated_at?: string;
}

export interface UserPerk {
  id: number;
  user_id: number;
  perk_id: number;

  valid_from: string | null;
  valid_until: string | null;

  status: 'Active' | 'Expired' | 'Inactive';

  used_value?: number | null;
  remaining_value?: number | null;

  created_at?: string;
  updated_at?: string;
}

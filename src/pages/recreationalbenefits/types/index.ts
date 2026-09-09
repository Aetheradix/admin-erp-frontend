// src/types/recreationalBenefits.ts

// ==========================================
// Enums / Literal Types
// ==========================================

export type RecreationalBenefitType =
  'Food Delivery' | 'Outstation Travel' | 'Gym Membership' | 'OTT Subscription' | 'Other';

export type RecreationalBenefitFrequency = 'One-Time' | 'Monthly' | 'Quarterly' | 'Yearly';

export type RecreationalBenefitStatus = 'Active' | 'Inactive' | 'Expired';

export type RecreationalBenefitAssignmentStatus = 'Active' | 'Inactive' | 'Expired' | 'Revoked';

export type RecreationalBenefitUsageStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

// ==========================================
// Generic JSON Configuration
// ==========================================

export type RecreationalBenefitJson = Record<string, unknown>;

// ==========================================
// Recreational Benefit
// ==========================================

export interface RecreationalBenefit {
  benefit_id: number;

  benefit_name: string;

  benefit_type: RecreationalBenefitType;

  benefit_description?: string | null;

  benefit_value?: number | null;

  currency: string;

  usage_limit?: number | null;

  usage_frequency: RecreationalBenefitFrequency;

  /**
   * Generic eligibility rules.
   *
   * Example:
   * {
   *   employment_type: ['Full-time'],
   *   departments: ['Engineering'],
   *   min_tenure_months: 6
   * }
   */
  eligibility?: RecreationalBenefitJson | null;

  /**
   * Generic perk-specific configuration.
   *
   * Food:
   * {
   *   provider: 'Swiggy',
   *   monthly_limit: 2000
   * }
   *
   * OTT:
   * {
   *   provider: 'Netflix',
   *   plan: 'Premium'
   * }
   *
   * Gym:
   * {
   *   gym_name: 'XYZ Fitness',
   *   membership_type: 'Annual'
   * }
   */
  configuration?: RecreationalBenefitJson | null;

  valid_from?: string | null;

  valid_until?: string | null;

  status: RecreationalBenefitStatus;

  created_by?: number | null;

  updated_by?: number | null;

  created_at?: string;

  updated_at?: string;
}

// ==========================================
// Create Benefit
// ==========================================

export interface CreateRecreationalBenefitRequest {
  benefit_name: string;

  benefit_type: RecreationalBenefitType;

  benefit_description?: string;

  benefit_value?: number | null;

  currency?: string;

  usage_limit?: number | null;

  usage_frequency?: RecreationalBenefitFrequency;

  eligibility?: RecreationalBenefitJson;

  configuration?: RecreationalBenefitJson;

  valid_from?: string | null;

  valid_until?: string | null;
}

// ==========================================
// Update Benefit
// ==========================================

export interface UpdateRecreationalBenefitRequest {
  benefit_name?: string;

  benefit_type?: RecreationalBenefitType;

  benefit_description?: string;

  benefit_value?: number | null;

  currency?: string;

  usage_limit?: number | null;

  usage_frequency?: RecreationalBenefitFrequency;

  eligibility?: RecreationalBenefitJson;

  configuration?: RecreationalBenefitJson;

  valid_from?: string | null;

  valid_until?: string | null;

  status?: RecreationalBenefitStatus;
}

// ==========================================
// Benefit Assignment
// ==========================================

export interface RecreationalBenefitAssignment {
  assignment_id: number;

  benefit_id: number;

  employee_id: number;

  assigned_date?: string;

  valid_from?: string | null;

  valid_until?: string | null;

  status: RecreationalBenefitAssignmentStatus;

  assigned_by?: number | null;

  created_at?: string;

  updated_at?: string;

  /**
   * Optional joined benefit information.
   * Useful for "My Benefits".
   */
  benefit?: RecreationalBenefit;

  /**
   * Optional employee information if
   * backend joins the users table.
   */
  employee?: {
    id: number;
    name?: string;
    email?: string;
  };
}

// ==========================================
// Assign Benefit
// ==========================================

export interface AssignRecreationalBenefitRequest {
  employee_id: number;

  valid_from?: string | null;

  valid_until?: string | null;
}

// ==========================================
// Benefit Usage
// ==========================================

export interface RecreationalBenefitUsage {
  usage_id: number;

  assignment_id: number;

  usage_amount?: number | null;

  usage_description?: string | null;

  usage_date?: string;

  status: RecreationalBenefitUsageStatus;

  approved_by?: number | null;

  approved_at?: string | null;

  created_at?: string;

  updated_at?: string;
}

// ==========================================
// Record Usage
// ==========================================

export interface RecordRecreationalBenefitUsageRequest {
  usage_amount: number;

  usage_description?: string;

  usage_date?: string;
}

// ==========================================
// Statistics
// ==========================================

export interface RecreationalBenefitStats {
  totalBenefits: number;

  activeBenefits: number;

  inactiveBenefits: number;

  expiredBenefits: number;

  totalAssignments: number;

  activeAssignments: number;

  expiredAssignments: number;

  revokedAssignments: number;

  totalUsage: number;

  pendingUsage: number;

  approvedUsage: number;

  rejectedUsage: number;

  cancelledUsage: number;

  totalAmountUsed: number;

  totalAmountPending: number;

  totalAmountApproved: number;

  totalAmountRejected: number;

  byType?: Record<string, number>;

  byMonth?: {
    month: string;
    count: number;
    amount: number;
  }[];
}

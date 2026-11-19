import type { StaffMember } from '@/types/models';

export type StaffPayload = Partial<StaffMember> & { contact_number?: string };

export interface CreateStaffResponse extends Partial<StaffMember> {
  data?: { id?: string | number };
  user?: { id?: string | number };
}

export function buildStaffPayload(data: Partial<StaffMember>): StaffPayload {
  return {
    username: data.name,
    email: data.email,
    role: data.role || data.designation,
    department: data.department,
    contact_number: data.phone || data.contact_no,
    status: data.status,
    join_date: data.joinDate,
    skills: data.skills,
    image_url: data.image || data.image_url,
    total_compensation: data.totalCompensation || data.total_compensation,
    annual_ctc: data.totalCompensation || data.total_compensation,
    tax_regime: data.taxRegime || 'New Regime',
    is_mid_year_joiner: Boolean(data.isMidYearJoiner),
    previous_employer_ytd: data.previousEmployerYtd,
    pan_number: data.panNumber || data.pan_number,
  };
}

export function toStaffFormMember(member: StaffMember): StaffMember {
  return {
    ...member,
    name: member.username || member.name,
    role: member.designation || member.role,
    phone: member.contact_no || member.phone,
    image: member.image_url || member.image,
    joinDate: member.join_date || member.joinDate,
    totalCompensation:
      member.totalCompensation ||
      member.total_compensation ||
      member.annualCtc ||
      member.annual_ctc ||
      '',
    taxRegime: member.taxRegime || member.tax_regime || 'New Regime',
    isMidYearJoiner: Boolean(member.isMidYearJoiner ?? member.is_mid_year_joiner),
    previousEmployerYtd: member.previousEmployerYtd ||
      member.previous_employer_ytd || {
        grossPay: 0,
        tdsDeducted: 0,
        pfDeducted: 0,
        ptDeducted: 0,
      },
    panNumber: member.panNumber || member.pan_number || '',
  };
}

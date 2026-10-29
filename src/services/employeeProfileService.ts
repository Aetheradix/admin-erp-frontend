/**
 * Employee Profile Completion Service
 * Manages profile completion state, form sections, dynamic fields,
 * document uploads, certifications, and employee ID assignment workflow.
 *
 * Dual-write pattern: localStorage (instant) + backend API (persistent).
 */

import { API_URL } from '@/config/env';
import { broadcastSync } from './syncService';
import { recordAuditLog } from './auditService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProfileStatus =
  'incomplete' | 'in_progress' | 'submitted' | 'changes_required' | 'approved' | 'id_assigned';

export interface ProfileDocument {
  id: string;
  type:
    | 'pan_card'
    | 'aadhaar'
    | 'bank_document'
    | 'salary_slip'
    | 'relieving_letter'
    | 'experience_letter'
    | 'degree_certificate'
    | 'marksheet'
    | 'certification'
    | 'profile_picture'
    | 'passport'
    | 'other';
  label: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: string;
  url?: string; // URL from backend (if uploaded)
  localData?: string; // base64 preview (local only)
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  rejectionReason?: string;
}

export interface CertificationEntry {
  id: string;
  title: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  description?: string;
  documentId?: string; // links to ProfileDocument
}

export interface EmploymentHistoryEntry {
  id: string;
  employer: string;
  designation: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  salary?: string;
  responsibilities?: string;
  documentIds?: string[]; // salary slips, relieving letter
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
  documentIds?: string[]; // certificates, marksheets
}

export interface PersonalDetails {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  contactNumber?: string;
  alternateContact?: string;
  email: string;
  currentAddress?: string;
  permanentAddress?: string;
  sameAsCurrentAddress?: boolean;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber?: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType?: string;
  documentId?: string; // bank document
}

export interface IdentityDocuments {
  panNumber?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  drivingLicense?: string;
  panDocumentId?: string;
  aadhaarDocumentId?: string;
  passportDocumentId?: string;
}

export interface ProfileCompletionData {
  userId: number;
  userEmail: string;
  status: ProfileStatus;
  lastSavedAt: string;
  completedSections: Record<string, boolean>;
  personal?: PersonalDetails;
  bank?: BankDetails;
  identity?: IdentityDocuments;
  employment?: EmploymentHistoryEntry[];
  education?: EducationEntry[];
  certifications?: CertificationEntry[];
  documents?: ProfileDocument[];
  profilePictureUrl?: string;
  profilePictureDocumentId?: string;
  // Hiring team assignments
  role?: string;
  department?: string;
  designation?: string;
  // Hiring team review
  reviewedBy?: { name: string; email: string; role: string };
  reviewedAt?: string;
  reviewNotes?: string;
  // Employee ID assignment
  employeeId?: string;
  employeeIdAssignedBy?: { name: string; email: string; role: string };
  employeeIdAssignedAt?: string;
  // Submission
  submittedAt?: string;
  approvedAt?: string;
}

// ─── Dynamic Form Configuration ───────────────────────────────────────────────

export type FieldType =
  'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox';

export interface FormFieldConfig {
  id: string;
  key?: string;
  section: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required: boolean;
  hidden: boolean;
  description?: string;
  options?: string[]; // For select type
  maxFileSizeMB?: number; // For file type
  allowedFileTypes?: string[]; // e.g. ['pdf', 'jpg']
  order: number;
  visibleToRoles?: string[]; // Which roles can see this field
  editableByRoles?: string[]; // Which roles can edit this field
}

export interface FormSectionConfig {
  id: string;
  label: string;
  title?: string;
  description?: string;
  icon?: string;
  order: number;
  hidden: boolean;
  required?: boolean;
  fields: FormFieldConfig[];
  assignedTeam?: string; // Which team is responsible for this section
  assignedToTeam?: string;
}

export interface FormConfiguration {
  id: string;
  name: string;
  description?: string;
  sections: FormSectionConfig[];
  createdBy: { name: string; email: string; role: string };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  applicableFor?: string[]; // Department or employee category
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const PROFILE_STORAGE_KEY = 'aether_employee_profiles';
const FORM_CONFIG_KEY = 'aether_profile_form_config';

// ─── Default Form Configuration ───────────────────────────────────────────────

export const DEFAULT_FORM_CONFIG: FormSectionConfig[] = [
  {
    id: 'personal',
    label: 'Personal & Contact Details',
    description: 'Your personal information and contact details',
    icon: 'User',
    order: 1,
    hidden: false,
    fields: [
      {
        id: 'fullName',
        section: 'personal',
        label: 'Full Name',
        type: 'text',
        required: true,
        hidden: false,
        order: 1,
      },
      {
        id: 'dateOfBirth',
        section: 'personal',
        label: 'Date of Birth',
        type: 'date',
        required: false,
        hidden: false,
        order: 2,
      },
      {
        id: 'gender',
        section: 'personal',
        label: 'Gender',
        type: 'select',
        options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
        required: false,
        hidden: false,
        order: 3,
      },
      {
        id: 'contactNumber',
        section: 'personal',
        label: 'Contact Number',
        type: 'tel',
        required: true,
        hidden: false,
        order: 4,
      },
      {
        id: 'alternateContact',
        section: 'personal',
        label: 'Alternate Contact',
        type: 'tel',
        required: false,
        hidden: false,
        order: 5,
      },
      {
        id: 'currentAddress',
        section: 'personal',
        label: 'Current Address',
        type: 'textarea',
        required: true,
        hidden: false,
        order: 6,
      },
      {
        id: 'permanentAddress',
        section: 'personal',
        label: 'Permanent Address',
        type: 'textarea',
        required: false,
        hidden: false,
        order: 7,
      },
      {
        id: 'emergencyContactName',
        section: 'personal',
        label: 'Emergency Contact Name',
        type: 'text',
        required: false,
        hidden: false,
        order: 8,
      },
      {
        id: 'emergencyContactPhone',
        section: 'personal',
        label: 'Emergency Contact Phone',
        type: 'tel',
        required: false,
        hidden: false,
        order: 9,
      },
    ],
  },
  {
    id: 'bank',
    label: 'Bank Account Details',
    description: 'Banking information for payroll processing',
    icon: 'CreditCard',
    order: 2,
    hidden: false,
    fields: [
      {
        id: 'accountHolderName',
        section: 'bank',
        label: 'Account Holder Name',
        type: 'text',
        required: true,
        hidden: false,
        order: 1,
      },
      {
        id: 'bankName',
        section: 'bank',
        label: 'Bank Name',
        type: 'text',
        required: true,
        hidden: false,
        order: 2,
      },
      {
        id: 'accountNumber',
        section: 'bank',
        label: 'Account Number',
        type: 'text',
        required: true,
        hidden: false,
        order: 3,
      },
      {
        id: 'confirmAccountNumber',
        section: 'bank',
        label: 'Confirm Account Number',
        type: 'text',
        required: true,
        hidden: false,
        order: 4,
      },
      {
        id: 'ifscCode',
        section: 'bank',
        label: 'IFSC Code',
        type: 'text',
        required: true,
        hidden: false,
        order: 5,
      },
      {
        id: 'branchName',
        section: 'bank',
        label: 'Branch Name',
        type: 'text',
        required: false,
        hidden: false,
        order: 6,
      },
      {
        id: 'accountType',
        section: 'bank',
        label: 'Account Type',
        type: 'select',
        options: ['Savings', 'Current', 'Salary'],
        required: false,
        hidden: false,
        order: 7,
      },
      {
        id: 'bankDocument',
        section: 'bank',
        label: 'Bank Document (Passbook / Cancelled Cheque)',
        type: 'file',
        required: false,
        hidden: false,
        order: 8,
        maxFileSizeMB: 5,
        allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
      },
    ],
  },
  {
    id: 'identity',
    label: 'Identity Documents',
    description: 'Government-issued identity verification documents',
    icon: 'Shield',
    order: 3,
    hidden: false,
    fields: [
      {
        id: 'panNumber',
        section: 'identity',
        label: 'PAN Card Number',
        type: 'text',
        required: true,
        hidden: false,
        order: 1,
      },
      {
        id: 'panDocument',
        section: 'identity',
        label: 'PAN Card Document',
        type: 'file',
        required: true,
        hidden: false,
        order: 2,
        maxFileSizeMB: 5,
        allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
      },
      {
        id: 'aadhaarNumber',
        section: 'identity',
        label: 'Aadhaar Number',
        type: 'text',
        required: true,
        hidden: false,
        order: 3,
      },
      {
        id: 'aadhaarDocument',
        section: 'identity',
        label: 'Aadhaar Document',
        type: 'file',
        required: true,
        hidden: false,
        order: 4,
        maxFileSizeMB: 5,
        allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
      },
      {
        id: 'passportNumber',
        section: 'identity',
        label: 'Passport Number',
        type: 'text',
        required: false,
        hidden: false,
        order: 5,
      },
      {
        id: 'passportDocument',
        section: 'identity',
        label: 'Passport Document',
        type: 'file',
        required: false,
        hidden: false,
        order: 6,
        maxFileSizeMB: 5,
        allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
      },
    ],
  },
  {
    id: 'employment',
    label: 'Previous Employment',
    description: 'Your work history and previous employment details',
    icon: 'Briefcase',
    order: 4,
    hidden: false,
    fields: [],
  },
  {
    id: 'education',
    label: 'Educational Qualifications',
    description: 'Your academic background and qualifications',
    icon: 'GraduationCap',
    order: 5,
    hidden: false,
    fields: [],
  },
  {
    id: 'certifications',
    label: 'Certifications & Achievements',
    description: 'Professional certifications, awards and accomplishments',
    icon: 'Award',
    order: 6,
    hidden: false,
    fields: [],
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function notifyChange(event: string) {
  broadcastSync(event as any);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`aether_${event}_updated`));
  }
}

// ─── Seeded Onboarding Profiles ───────────────────────────────────────────────

export const SEEDED_PROFILES: ProfileCompletionData[] = [
  {
    userId: 99,
    userEmail: 'luna@yopmail.com',
    status: 'in_progress',
    lastSavedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    completedSections: {
      personal: true,
      bank: true,
      identity: false,
      employment: false,
      education: false,
      certifications: false,
      profile_picture: false,
    },
    personal: {
      fullName: 'Luna',
      email: 'luna@yopmail.com',
      contactNumber: '92129787364',
      dateOfBirth: '1998-05-14',
      gender: 'Female',
      currentAddress: 'Flat 402, Green Valley Apartments, Mumbai, Maharashtra 400076',
      permanentAddress: 'Flat 402, Green Valley Apartments, Mumbai, Maharashtra 400076',
      sameAsCurrentAddress: true,
      emergencyContactName: 'Ramesh Patel',
      emergencyContactPhone: '+91 9820011223',
      emergencyContactRelation: 'Parent',
    },
    bank: {
      accountHolderName: 'Luna',
      bankName: 'HDFC Bank',
      accountNumber: '50100492817263',
      confirmAccountNumber: '50100492817263',
      ifscCode: 'HDFC0001234',
      branchName: 'Hiranandani Powai Branch',
      accountType: 'Savings',
    },
    identity: {
      panNumber: 'ABCPL1234D',
      aadhaarNumber: '987654321098',
    },
    documents: [
      {
        id: 'doc-pan-luna',
        type: 'pan_card',
        label: 'PAN Card Copy',
        fileName: 'luna_pan_card.pdf',
        fileSize: 420000,
        uploadedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        status: 'uploaded',
        url: '#',
      },
      {
        id: 'doc-cheque-luna',
        type: 'bank_document',
        label: 'Cancelled Cheque',
        fileName: 'hdfc_cancelled_cheque.pdf',
        fileSize: 310000,
        uploadedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        status: 'uploaded',
        url: '#',
      },
    ],
  },
  {
    userId: 101,
    userEmail: 'marcus.vance@aetheradix.com',
    status: 'in_progress',
    lastSavedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    completedSections: {
      personal: true,
      bank: false,
      identity: false,
      employment: false,
      education: false,
      certifications: false,
      profile_picture: false,
    },
    personal: {
      fullName: 'Marcus Vance',
      email: 'marcus.vance@aetheradix.com',
      contactNumber: '+1 (555) 018-2231',
      dateOfBirth: '1995-11-20',
      gender: 'Male',
      currentAddress: '742 Evergreen Terrace, Austin, TX',
      permanentAddress: '742 Evergreen Terrace, Austin, TX',
      sameAsCurrentAddress: true,
      emergencyContactName: 'Sarah Vance',
      emergencyContactPhone: '+1 (555) 018-9900',
      emergencyContactRelation: 'Spouse',
    },
  },
  {
    userId: 102,
    userEmail: 'elena.rostova@aetheradix.com',
    status: 'id_assigned',
    employeeId: 'EMP-0042',
    lastSavedAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    completedSections: {
      personal: true,
      bank: true,
      identity: true,
      employment: true,
      education: true,
      certifications: true,
      profile_picture: true,
    },
    personal: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@aetheradix.com',
      contactNumber: '+1 (555) 012-4411',
      dateOfBirth: '1992-08-15',
      gender: 'Female',
      currentAddress: '78 Market St, New York, NY',
      permanentAddress: '78 Market St, New York, NY',
      sameAsCurrentAddress: true,
      emergencyContactName: 'Mikhail Rostov',
      emergencyContactPhone: '+1 (555) 012-9988',
      emergencyContactRelation: 'Parent',
    },
    bank: {
      accountHolderName: 'Elena Rostova',
      bankName: 'Chase Bank',
      accountNumber: '123456789012',
      ifscCode: 'CHAS0001010',
      branchName: 'Manhattan Financial Center',
      accountType: 'Checking',
    },
    identity: {
      panNumber: 'ELNPR9988K',
      aadhaarNumber: '112233445566',
      passportNumber: 'Z8765432',
    },
  },
  {
    userId: 103,
    userEmail: 'deedee@yopmail.com',
    status: 'submitted',
    lastSavedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    completedSections: {
      personal: true,
      bank: true,
      identity: true,
      employment: true,
      education: true,
      certifications: false,
      profile_picture: false,
    },
    personal: {
      fullName: 'DeeDee User',
      email: 'deedee@yopmail.com',
      contactNumber: '+91 9876543210',
      currentAddress: 'Sector 62, Noida, Uttar Pradesh',
      permanentAddress: 'Sector 62, Noida, Uttar Pradesh',
      emergencyContactName: 'Sunita User',
      emergencyContactPhone: '+91 9876500000',
      emergencyContactRelation: 'Parent',
    },
    bank: {
      accountHolderName: 'DeeDee User',
      bankName: 'State Bank of India',
      accountNumber: '302918273645',
      ifscCode: 'SBIN0004567',
      branchName: 'Noida Sector 62',
      accountType: 'Savings',
    },
    identity: {
      panNumber: 'DEEDE1234Z',
      aadhaarNumber: '445566778899',
    },
  },
];

// ─── Profile CRUD ─────────────────────────────────────────────────────────────

export function getEmployeeProfile(userIdOrEmail: number | string): ProfileCompletionData | null {
  try {
    const profiles = getAllEmployeeProfiles();
    const found = profiles.find(
      (p) =>
        p.userId === userIdOrEmail ||
        p.userEmail?.toLowerCase().trim() === String(userIdOrEmail).toLowerCase().trim() ||
        String(p.userId) === String(userIdOrEmail)
    );
    if (found) return found;

    // Fallback directly to aether_staff_list
    try {
      const rawStaff = localStorage.getItem('aether_staff_list');
      if (rawStaff) {
        const staffList = JSON.parse(rawStaff);
        const s = staffList.find(
          (st: any) =>
            st.email?.toLowerCase().trim() === String(userIdOrEmail).toLowerCase().trim() ||
            String(st.id) === String(userIdOrEmail)
        );
        if (s) {
          const empId = s.employee_id || s.employee_code || s.employeeId;
          return {
            userId: s.id || Date.now(),
            userEmail: (s.email || '').toLowerCase().trim(),
            status: empId ? 'id_assigned' : 'incomplete',
            employeeId: empId,
            role: s.role,
            department: s.department,
            designation: s.designation,
            lastSavedAt: new Date().toISOString(),
            completedSections: {},
            personal: {
              fullName: s.name || s.username || '',
              email: s.email,
              contactNumber: s.contact_number || s.contact_no || s.phone,
            },
          };
        }
      }
    } catch {}

    return null;
  } catch {
    return null;
  }
}

export function getAllEmployeeProfiles(): ProfileCompletionData[] {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    const existing: ProfileCompletionData[] = raw ? JSON.parse(raw) : [];

    // Ensure all seeded profiles exist in list
    const combined = [...existing];
    for (const seed of SEEDED_PROFILES) {
      const matchIdx = combined.findIndex(
        (p) =>
          p.userEmail?.toLowerCase() === seed.userEmail?.toLowerCase() || p.userId === seed.userId
      );
      if (matchIdx === -1) {
        combined.push(seed);
      }
    }

    // Include newly invited users so hiring team can monitor their onboarding status
    try {
      const rawInv = localStorage.getItem('aether_user_invitations');
      if (rawInv) {
        const invitations = JSON.parse(rawInv);
        for (const inv of invitations) {
          if (inv.email) {
            const matchIdx = combined.findIndex(
              (p) => p.userEmail?.toLowerCase() === inv.email.toLowerCase()
            );
            if (matchIdx === -1) {
              combined.push({
                userId: Date.now() + Math.floor(Math.random() * 1000),
                userEmail: inv.email.toLowerCase(),
                status: 'incomplete',
                lastSavedAt: inv.invitedAt || new Date().toISOString(),
                completedSections: {},
                personal: {
                  fullName: inv.name || '',
                  email: inv.email,
                },
              });
            }
          }
        }
      }
    } catch {}

    // Include registered staff accounts
    try {
      const rawStaff = localStorage.getItem('aether_staff_list');
      if (rawStaff) {
        const staffList = JSON.parse(rawStaff);
        for (const s of staffList) {
          if (s.email) {
            const matchIdx = combined.findIndex(
              (p) =>
                p.userEmail?.toLowerCase() === s.email.toLowerCase() ||
                (s.id && String(p.userId) === String(s.id))
            );
            const empId = s.employee_id || s.employee_code || s.employeeId;
            if (matchIdx === -1) {
              combined.push({
                userId: s.id || Date.now(),
                userEmail: s.email.toLowerCase(),
                status: empId ? 'id_assigned' : 'incomplete',
                employeeId: empId,
                role: s.role,
                department: s.department,
                designation: s.designation,
                lastSavedAt: new Date().toISOString(),
                completedSections: {},
                personal: {
                  fullName: s.name || s.username || '',
                  email: s.email,
                  contactNumber: s.contact_number || s.contact_no || s.phone,
                },
              });
            } else {
              if (
                empId &&
                (!combined[matchIdx].employeeId ||
                  combined[matchIdx].employeeId === 'N/A' ||
                  combined[matchIdx].employeeId === 'NA')
              ) {
                combined[matchIdx].employeeId = empId;
                if (combined[matchIdx].status === 'incomplete') {
                  combined[matchIdx].status = 'id_assigned';
                }
              }
              if (s.role && !combined[matchIdx].role) combined[matchIdx].role = s.role;
              if (s.department && !combined[matchIdx].department)
                combined[matchIdx].department = s.department;
              if (s.designation && !combined[matchIdx].designation)
                combined[matchIdx].designation = s.designation;
            }
          }
        }
      }
    } catch {}

    if (!raw) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(combined));
    }
    return combined;
  } catch {
    return SEEDED_PROFILES;
  }
}

export function saveEmployeeProfile(data: ProfileCompletionData): void {
  try {
    const profiles = getAllEmployeeProfiles();
    const idx = profiles.findIndex(
      (p) =>
        String(p.userId) === String(data.userId) ||
        (Boolean(data.userEmail) && p.userEmail?.toLowerCase() === data.userEmail.toLowerCase())
    );
    if (idx >= 0) {
      profiles[idx] = { ...data, lastSavedAt: new Date().toISOString() };
    } else {
      profiles.push({ ...data, lastSavedAt: new Date().toISOString() });
    }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
    notifyChange('employee_profiles');

    // Background sync to backend
    try {
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/employee-profile/${data.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      }).catch(() => {
        fetch(`${API_URL}/employee-profiles/${data.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        }).catch(() => {});
      });
    } catch {
      // Ignore backend errors
    }
  } catch (err) {
    console.error('Failed to save employee profile:', err);
  }
}

export function updateProfileSection<K extends keyof ProfileCompletionData>(
  userId: number,
  userEmail: string,
  section: K,
  value: ProfileCompletionData[K],
  sectionKey: string,
  actorName: string
): void {
  const existing = getEmployeeProfile(userId) || {
    userId,
    userEmail,
    status: 'in_progress' as ProfileStatus,
    lastSavedAt: new Date().toISOString(),
    completedSections: {},
  };

  const candidate: ProfileCompletionData = {
    ...existing,
    [section]: value,
    status: existing.status === 'incomplete' ? 'in_progress' : existing.status,
  };

  const isValid = isSectionValidAndComplete(sectionKey, candidate);

  const updated: ProfileCompletionData = {
    ...candidate,
    completedSections: {
      ...existing.completedSections,
      [sectionKey]: isValid,
    },
  };

  saveEmployeeProfile(updated);

  recordAuditLog({
    action: `Profile Section Updated: ${sectionKey}`,
    category: 'profile',
    user: actorName,
    userEmail,
    target: `Employee Profile (${userEmail})`,
    targetEmail: userEmail,
    status: 'Success',
    details: `Employee updated the "${sectionKey}" section of their profile completion form.`,
  });
}

export function submitProfileForReview(userId: number, userEmail: string, actorName: string): void {
  const existing = getEmployeeProfile(userId);
  if (!existing) return;

  const updated: ProfileCompletionData = {
    ...existing,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };

  saveEmployeeProfile(updated);

  recordAuditLog({
    action: 'Profile Submitted for Review',
    category: 'profile',
    user: actorName,
    userEmail,
    target: `Employee Profile (${userEmail})`,
    targetEmail: userEmail,
    status: 'Success',
    details: 'Employee submitted their complete profile for hiring team review.',
  });
}

export function requestProfileChanges(
  userId: number | string,
  reviewerName: string,
  reviewerEmail: string,
  reviewerRole: string,
  notes: string
): void {
  const existing = getEmployeeProfile(userId);
  if (!existing) return;

  const updated: ProfileCompletionData = {
    ...existing,
    status: 'changes_required',
    reviewedBy: { name: reviewerName, email: reviewerEmail, role: reviewerRole },
    reviewedAt: new Date().toISOString(),
    reviewNotes: notes,
  };

  saveEmployeeProfile(updated);

  recordAuditLog({
    action: 'Profile Changes Requested',
    category: 'profile',
    user: reviewerName,
    userEmail: reviewerEmail,
    target: `Employee Profile (${existing.userEmail})`,
    targetEmail: existing.userEmail,
    status: 'Warning',
    details: `Hiring team member "${reviewerName}" (${reviewerRole}) requested changes. Notes: ${notes}`,
  });
}

export function approveProfile(
  userId: number | string,
  reviewerName: string,
  reviewerEmail: string,
  reviewerRole: string,
  employeeEmail?: string,
  employeeName?: string
): void {
  let existing = getEmployeeProfile(userId);
  if (!existing && employeeEmail) {
    existing = ensureEmployeeProfileExists(userId, employeeEmail, employeeName);
  }
  if (!existing) return;

  const updated: ProfileCompletionData = {
    ...existing,
    status: 'approved',
    reviewedBy: { name: reviewerName, email: reviewerEmail, role: reviewerRole },
    reviewedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  };

  saveEmployeeProfile(updated);

  // Sync approval to backend API
  try {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/employee-profile/${userId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ reviewerName, reviewerEmail, reviewerRole }),
    }).catch(() => {});
  } catch {}

  recordAuditLog({
    action: 'Profile Approved',
    category: 'profile',
    user: reviewerName,
    userEmail: reviewerEmail,
    target: `Employee Profile (${existing.userEmail})`,
    targetEmail: existing.userEmail,
    status: 'Success',
    details: `Profile approved by "${reviewerName}" (${reviewerRole}).`,
  });
}

export interface AssignIdResult {
  success: boolean;
  error?: string;
}

export function assignEmployeeId(
  userId: number | string,
  employeeId: string,
  assignerName: string,
  assignerEmail: string,
  assignerRole: string,
  employeeEmail?: string,
  employeeName?: string,
  options?: {
    role?: string;
    department?: string;
    designation?: string;
  }
): AssignIdResult {
  const cleanId = employeeId.trim();
  if (!cleanId) {
    return { success: false, error: 'Employee ID cannot be empty.' };
  }

  // Case-insensitive role check for authorized roles
  const normalizedRole = (assignerRole || '').toLowerCase().replace(/[\s_-]/g, '');
  const allowed =
    ['superadmin', 'admin', 'hradmin', 'hr', 'hiringmanager', 'hiringteam'].includes(
      normalizedRole
    ) ||
    assignerRole === 'SuperAdmin' ||
    assignerRole === 'Admin' ||
    assignerRole === 'HrAdmin';

  if (!allowed) {
    recordAuditLog({
      action: 'Employee ID Assignment Denied',
      category: 'admin',
      user: assignerName,
      userEmail: assignerEmail,
      target: `Employee (userId: ${userId})`,
      status: 'Warning',
      details: `Unauthorized attempt to assign employee ID. Role "${assignerRole}" is not permitted.`,
    });
    return { success: false, error: 'You do not have permission to assign employee IDs.' };
  }

  let existing = getEmployeeProfile(userId);
  if (!existing && employeeEmail) {
    existing = ensureEmployeeProfileExists(userId, employeeEmail, employeeName);
  }
  if (!existing) {
    return { success: false, error: 'Employee profile not found.' };
  }

  // Validate uniqueness
  const allProfiles = getAllEmployeeProfiles();
  const duplicate = allProfiles.find(
    (p) =>
      p.employeeId &&
      p.employeeId.trim().toLowerCase() === cleanId.toLowerCase() &&
      String(p.userId) !== String(userId) &&
      p.userEmail?.trim().toLowerCase() !== existing.userEmail?.trim().toLowerCase()
  );
  if (duplicate) {
    return {
      success: false,
      error: `Employee ID "${cleanId}" is already assigned to ${duplicate.personal?.fullName || duplicate.userEmail}.`,
    };
  }

  const updated: ProfileCompletionData = {
    ...existing,
    status: 'id_assigned',
    employeeId: cleanId,
    role: options?.role || existing.role,
    department: options?.department !== undefined ? options.department : existing.department,
    designation: options?.designation !== undefined ? options.designation : existing.designation,
    employeeIdAssignedBy: { name: assignerName, email: assignerEmail, role: assignerRole },
    employeeIdAssignedAt: new Date().toISOString(),
  };

  saveEmployeeProfile(updated);

  // Sync assigned employee ID & role/dept to backend API
  try {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/employee-profile/${userId}/assign-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        employeeId: cleanId,
        role: options?.role,
        department: options?.department,
        designation: options?.designation,
      }),
    }).catch(() => {});

    // Also update users endpoint
    fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        employee_id: cleanId,
        ...(options?.role ? { role: options.role } : {}),
        ...(options?.department ? { department: options.department } : {}),
        ...(options?.designation ? { designation: options.designation } : {}),
      }),
    }).catch(() => {});
  } catch {}

  // Update staff list cache in localStorage
  try {
    const staffStr = localStorage.getItem('aether_staff_list');
    if (staffStr) {
      const staffList = JSON.parse(staffStr);
      const sIdx = staffList.findIndex(
        (s: any) =>
          String(s.id) === String(userId) ||
          (existing.userEmail && s.email?.toLowerCase() === existing.userEmail.toLowerCase())
      );
      if (sIdx >= 0) {
        staffList[sIdx] = {
          ...staffList[sIdx],
          employee_id: cleanId,
          employee_code: cleanId,
          ...(options?.role ? { role: options.role } : {}),
          ...(options?.department ? { department: options.department } : {}),
          ...(options?.designation ? { designation: options.designation } : {}),
        };
        localStorage.setItem('aether_staff_list', JSON.stringify(staffList));
      }
    }
  } catch {}

  // Update logged-in user if matching
  try {
    const savedUserStr = localStorage.getItem('user');
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      if (
        String(savedUser.id) === String(userId) ||
        savedUser.email?.toLowerCase() === existing.userEmail?.toLowerCase()
      ) {
        savedUser.employee_id = cleanId;
        savedUser.employeeId = cleanId;
        if (options?.role) savedUser.role = options.role;
        if (options?.department) savedUser.department = options.department;
        localStorage.setItem('user', JSON.stringify(savedUser));
        window.dispatchEvent(new CustomEvent('auth_user_updated'));
      }
    }
  } catch {}

  recordAuditLog({
    action: 'Employee ID & Role Assigned',
    category: 'admin',
    user: assignerName,
    userEmail: assignerEmail,
    target: `Employee Profile (${existing.userEmail})`,
    targetEmail: existing.userEmail,
    status: 'Success',
    details: `Employee ID "${cleanId}" assigned to ${existing.userEmail} by ${assignerName} (${assignerRole}). Role: ${options?.role || existing.role || 'Unchanged'}, Dept: ${options?.department || existing.department || 'Unchanged'}.`,
    changes: [
      { field: 'Employee ID', from: existing.employeeId || '(none)', to: cleanId },
      { field: 'Role', from: existing.role || '(none)', to: options?.role || existing.role || '' },
      {
        field: 'Department',
        from: existing.department || '(none)',
        to: options?.department || existing.department || '',
      },
      { field: 'Profile Status', from: existing.status, to: 'id_assigned' },
    ],
  });

  return { success: true };
}

// ─── Form Configuration ───────────────────────────────────────────────────────

export function getFormConfiguration(): FormSectionConfig[] {
  try {
    const raw = localStorage.getItem(FORM_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(FORM_CONFIG_KEY, JSON.stringify(DEFAULT_FORM_CONFIG));
    return DEFAULT_FORM_CONFIG;
  } catch {
    return DEFAULT_FORM_CONFIG;
  }
}

export function saveFormConfiguration(
  sections: FormSectionConfig[],
  editorName: string = 'Admin',
  editorEmail: string = '',
  editorRole: string = 'Admin'
): void {
  localStorage.setItem(FORM_CONFIG_KEY, JSON.stringify(sections));
  notifyChange('profile_form_config');

  recordAuditLog({
    action: 'Profile Form Configuration Updated',
    category: 'admin',
    user: editorName,
    userEmail: editorEmail,
    target: 'Profile Form Configuration',
    status: 'Success',
    details: `Form configuration updated by "${editorName}" (${editorRole}). Sections: ${sections.map((s) => s.label).join(', ')}.`,
  });
}

// ─── Passport Validation & Character Limit ─────────────────────────────────────

/**
 * Passport Number Validation Rules:
 * - Indian Passport Standard: Exactly 8 characters (1 uppercase letter followed by 7 digits, e.g. A1234567, Z8765432).
 * - Maximum character limit: 8 characters.
 * - Leading and trailing whitespace is trimmed, and comparison is case-insensitive.
 */
export const PASSPORT_MAX_LENGTH = 8;
export const PASSPORT_REGEX = /^[A-Z][0-9]{7}$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePassportNumber(value?: string | null): ValidationResult {
  if (!value) return { isValid: true };
  const trimmed = value.trim();
  if (trimmed === '') return { isValid: true }; // Optional field

  if (trimmed.length > PASSPORT_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Passport number cannot exceed ${PASSPORT_MAX_LENGTH} characters.`,
    };
  }

  const upper = trimmed.toUpperCase();
  if (!PASSPORT_REGEX.test(upper)) {
    return {
      isValid: false,
      error: 'Invalid passport format. Must be 1 letter followed by 7 digits (e.g., A1234567).',
    };
  }

  return { isValid: true };
}

// ─── Section Completion Validation ────────────────────────────────────────────

/**
 * Validates whether an employee profile section is genuinely complete according to
 * required fields and validation rules.
 */
export function isSectionValidAndComplete(
  sectionId: string,
  profile: ProfileCompletionData | null
): boolean {
  if (!profile) return false;

  switch (sectionId) {
    case 'profile_picture': {
      return Boolean(profile.profilePictureUrl);
    }
    case 'personal': {
      const p = profile.personal;
      if (!p) return false;
      return Boolean(
        p.fullName?.trim() &&
        p.email?.trim() &&
        p.contactNumber?.trim() &&
        p.currentAddress?.trim()
      );
    }
    case 'bank': {
      const b = profile.bank;
      if (!b) return false;
      return Boolean(
        b.accountHolderName?.trim() &&
        b.bankName?.trim() &&
        b.accountNumber?.trim() &&
        b.ifscCode?.trim()
      );
    }
    case 'identity': {
      const id = profile.identity;
      if (!id) return false;
      const cleanPan = id.panNumber?.trim() || '';
      const cleanAadhaar = id.aadhaarNumber?.trim().replace(/[\s-]/g, '') || '';
      const hasPan = Boolean(cleanPan && (cleanPan.length === 10 || cleanPan.includes('•')));
      const hasAadhaar = Boolean(cleanAadhaar && (cleanAadhaar.length === 12 || cleanAadhaar.includes('•')));
      if (!hasPan || !hasAadhaar) return false;

      if (id.passportNumber && id.passportNumber.trim() && !id.passportNumber.includes('•')) {
        const pRes = validatePassportNumber(id.passportNumber);
        if (!pRes.isValid) return false;
      }
      return true;
    }
    case 'education': {
      if (!profile.education || !Array.isArray(profile.education) || profile.education.length === 0) {
        return false;
      }
      return profile.education.every(
        (e) => Boolean(e.institution?.trim() && e.degree?.trim())
      );
    }
    case 'employment': {
      // Optional section: only marked complete if user added valid employment records
      if (!profile.employment || !Array.isArray(profile.employment) || profile.employment.length === 0) {
        return false;
      }
      return profile.employment.every(
        (e) => Boolean(e.employer?.trim() && e.designation?.trim())
      );
    }
    case 'certifications': {
      // Optional section: only marked complete if user added valid certifications
      if (!profile.certifications || !Array.isArray(profile.certifications) || profile.certifications.length === 0) {
        return false;
      }
      return profile.certifications.every(
        (c) => Boolean(c.title?.trim() && c.issuingOrganization?.trim())
      );
    }
    default:
      return Boolean(profile.completedSections?.[sectionId]);
  }
}

// ─── Completion Percentage ────────────────────────────────────────────────────

export function calculateCompletionPercentage(
  profile: ProfileCompletionData | null,
  formConfig: FormSectionConfig[]
): number {
  if (!profile) return 0;

  const activeSections = formConfig.filter((s) => !s.hidden);
  if (activeSections.length === 0) return 0;

  // Required sections for mandatory 100% completion (employment and certifications are optional)
  const requiredSections = activeSections.filter(
    (s) => s.id !== 'employment' && s.id !== 'certifications' && s.id !== 'profile_picture'
  );

  if (requiredSections.length === 0) return 100;

  let totalScore = 0;

  for (const s of requiredSections) {
    if (s.id === 'personal') {
      const p = profile.personal;
      let fieldCount = 0;
      if (p?.fullName?.trim()) fieldCount++;
      if (p?.email?.trim()) fieldCount++;
      if (p?.contactNumber?.trim()) fieldCount++;
      if (p?.currentAddress?.trim()) fieldCount++;
      totalScore += (fieldCount / 4) * 100;
    } else if (s.id === 'bank') {
      const b = profile.bank;
      let fieldCount = 0;
      if (b?.accountHolderName?.trim()) fieldCount++;
      if (b?.bankName?.trim()) fieldCount++;
      if (b?.accountNumber?.trim()) fieldCount++;
      if (b?.ifscCode?.trim()) fieldCount++;
      totalScore += (fieldCount / 4) * 100;
    } else if (s.id === 'identity') {
      const id = profile.identity;
      let fieldCount = 0;
      const cleanPan = id?.panNumber?.trim() || '';
      const cleanAadhaar = id?.aadhaarNumber?.trim().replace(/[\s-]/g, '') || '';
      if (cleanPan && (cleanPan.length === 10 || cleanPan.includes('•'))) fieldCount++;
      if (cleanAadhaar && (cleanAadhaar.length === 12 || cleanAadhaar.includes('•'))) fieldCount++;
      totalScore += (fieldCount / 2) * 100;
    } else if (s.id === 'education') {
      const hasEdu = Boolean(
        profile.education &&
        Array.isArray(profile.education) &&
        profile.education.length > 0 &&
        profile.education.some((e) => e.institution?.trim() && e.degree?.trim())
      );
      totalScore += hasEdu ? 100 : 0;
    } else {
      totalScore += isSectionValidAndComplete(s.id, profile) ? 100 : 0;
    }
  }

  const rawPercent = Math.round(totalScore / requiredSections.length);
  return Math.min(100, Math.max(0, rawPercent));
}

export function getIncompleteRequiredSections(
  profile: ProfileCompletionData | null,
  formConfig: FormSectionConfig[]
): FormSectionConfig[] {
  if (!profile) {
    return formConfig.filter(
      (s) => !s.hidden && s.id !== 'employment' && s.id !== 'certifications' && s.id !== 'profile_picture'
    );
  }
  return formConfig.filter(
    (s) =>
      !s.hidden &&
      s.id !== 'employment' &&
      s.id !== 'certifications' &&
      s.id !== 'profile_picture' &&
      !isSectionValidAndComplete(s.id, profile)
  );
}

/**
 * Returns a human-readable list of specific missing required fields for a section
 */
export function getSectionMissingFields(
  sectionId: string,
  profile: ProfileCompletionData | null
): string[] {
  if (!profile) return ['All section details'];
  const missing: string[] = [];

  switch (sectionId) {
    case 'profile_picture':
      if (!profile.profilePictureUrl) {
        missing.push('Profile Picture');
      }
      break;
    case 'personal': {
      const p = profile.personal;
      if (!p?.fullName?.trim()) missing.push('Full Name');
      if (!p?.email?.trim()) missing.push('Email Address');
      if (!p?.contactNumber?.trim()) missing.push('Contact Number');
      if (!p?.currentAddress?.trim()) missing.push('Current Address');
      break;
    }
    case 'bank': {
      const b = profile.bank;
      if (!b?.accountHolderName?.trim()) missing.push('Account Holder Name');
      if (!b?.bankName?.trim()) missing.push('Bank Name');
      if (!b?.accountNumber?.trim()) missing.push('Account Number');
      if (!b?.ifscCode?.trim()) missing.push('IFSC Code');
      break;
    }
    case 'identity': {
      const id = profile.identity;
      const pan = id?.panNumber?.trim() || '';
      const aadhaar = id?.aadhaarNumber?.trim().replace(/[\s-]/g, '') || '';
      const isPanValid = pan.length === 10 || (pan.includes('•') && pan.length >= 7);
      const isAadhaarValid = aadhaar.length === 12 || (aadhaar.includes('•') && aadhaar.length >= 8);
      if (!isPanValid) missing.push('10-character PAN Card Number');
      if (!isAadhaarValid) missing.push('12-digit Aadhaar Number');
      break;
    }
    case 'education': {
      if (!profile.education || !Array.isArray(profile.education) || profile.education.length === 0) {
        missing.push('At least one Educational Qualification');
      } else {
        const hasMissing = profile.education.some((e) => !e.institution?.trim() || !e.degree?.trim());
        if (hasMissing) missing.push('Degree and Institution for all qualifications');
      }
      break;
    }
  }

  return missing;
}

// ─── Document Helpers ─────────────────────────────────────────────────────────

/**
 * Securely uploads an identity card or bank document to the backend private vault.
 */
export async function uploadSecureDocumentToBackend(
  userId: number,
  file: File,
  docType: ProfileDocument['type'],
  label: string
): Promise<ProfileDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', String(userId));
  formData.append('documentType', docType);
  formData.append('label', label);

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/employee-profile/documents/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Secure upload failed.');
  }

  const resJson = await response.json();
  const uploaded = resJson.data;

  // Sync to local profile
  const profile = getEmployeeProfile(userId);
  const newDoc: ProfileDocument = {
    id: uploaded.id,
    type: docType,
    label,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadedAt: uploaded.uploadedAt,
    url: uploaded.url,
    status: 'uploaded',
  };

  if (profile) {
    const updatedDocs = [...(profile.documents || []).filter((d) => d.id !== newDoc.id), newDoc];
    saveEmployeeProfile({ ...profile, documents: updatedDocs });
  }

  return newDoc;
}

export function addDocument(
  userId: number,
  document: Omit<ProfileDocument, 'id' | 'uploadedAt'>
): ProfileDocument {
  const profile = getEmployeeProfile(userId);
  const newDoc: ProfileDocument = {
    ...document,
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    uploadedAt: new Date().toISOString(),
  };

  const updated: ProfileCompletionData = {
    ...(profile || {
      userId,
      userEmail: '',
      status: 'in_progress',
      lastSavedAt: new Date().toISOString(),
      completedSections: {},
    }),
    documents: [...(profile?.documents || []), newDoc],
  };

  saveEmployeeProfile(updated as ProfileCompletionData);
  return newDoc;
}

export function removeDocument(userId: number, documentId: string): void {
  const profile = getEmployeeProfile(userId);
  if (!profile) return;

  const updated: ProfileCompletionData = {
    ...profile,
    documents: (profile.documents || []).filter((d) => d.id !== documentId),
  };
  saveEmployeeProfile(updated);
}



/**
 * Ensures an employee profile exists for an invited or registered user,
 * keeping the Hiring & Onboarding monitor up to date.
 */
export function ensureEmployeeProfileExists(
  userId: number | string,
  userEmail: string,
  fullName?: string,
  role?: string,
  department?: string,
  additionalDetails?: Partial<NonNullable<ProfileCompletionData['personal']>>
): ProfileCompletionData {
  const existing = getEmployeeProfile(userId) || (userEmail ? getEmployeeProfile(userEmail) : null);
  if (existing) {
    if (fullName || additionalDetails) {
      const updated: ProfileCompletionData = {
        ...existing,
        role: role || existing.role,
        department: department || existing.department,
        status: existing.status === 'incomplete' ? 'in_progress' : existing.status,
        completedSections: {
          ...existing.completedSections,
          ...(additionalDetails ? { personal: true } : {}),
        },
        personal: {
          ...existing.personal,
          fullName: fullName || existing.personal?.fullName || '',
          email: userEmail || existing.userEmail,
          ...additionalDetails,
        },
      };
      saveEmployeeProfile(updated);
      return updated;
    }
    return existing;
  }

  const numericId = typeof userId === 'number' ? userId : Date.now();
  const newProfile: ProfileCompletionData = {
    userId: numericId,
    userEmail: userEmail.toLowerCase(),
    role: role || 'Employee',
    department: department || '',
    status: additionalDetails ? 'in_progress' : 'incomplete',
    lastSavedAt: new Date().toISOString(),
    completedSections: additionalDetails ? { personal: true } : {},
    personal: {
      fullName: fullName || '',
      email: userEmail,
      ...additionalDetails,
    },
  };

  saveEmployeeProfile(newProfile);
  return newProfile;
}

/**
 * Hydrates and syncs all employee profiles from the backend database
 */
export async function syncProfilesFromBackend(): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. Sync from employee-profile endpoint
    try {
      const res = await fetch(`${API_URL}/employee-profile`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const backendProfiles: ProfileCompletionData[] = json.data || json;
        if (Array.isArray(backendProfiles) && backendProfiles.length > 0) {
          const local = getAllEmployeeProfiles();
          const merged = [...local];
          for (const bp of backendProfiles) {
            const idx = merged.findIndex(
              (p) =>
                String(p.userId) === String(bp.userId) ||
                (Boolean(bp.userEmail) && p.userEmail?.toLowerCase() === bp.userEmail.toLowerCase())
            );
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                ...bp,
                status: bp.status || merged[idx].status,
                employeeId: bp.employeeId || merged[idx].employeeId,
                role: bp.role || merged[idx].role,
                department: bp.department || merged[idx].department,
                designation: bp.designation || merged[idx].designation,
                completedSections: {
                  ...(merged[idx].completedSections || {}),
                  ...(bp.completedSections || {}),
                },
                personal:
                  merged[idx].personal || bp.personal
                    ? {
                        fullName: bp.personal?.fullName || merged[idx].personal?.fullName || '',
                        email:
                          bp.personal?.email ||
                          merged[idx].personal?.email ||
                          bp.userEmail ||
                          merged[idx].userEmail ||
                          '',
                        ...(merged[idx].personal || {}),
                        ...(bp.personal || {}),
                      }
                    : undefined,
                bank: bp.bank || merged[idx].bank,
                identity: bp.identity || merged[idx].identity,
                employment:
                  bp.employment && bp.employment.length > 0
                    ? bp.employment
                    : merged[idx].employment,
                education:
                  bp.education && bp.education.length > 0 ? bp.education : merged[idx].education,
                certifications:
                  bp.certifications && bp.certifications.length > 0
                    ? bp.certifications
                    : merged[idx].certifications,
                documents:
                  bp.documents && bp.documents.length > 0 ? bp.documents : merged[idx].documents,
              };
            } else {
              merged.push(bp);
            }
          }
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));
          notifyChange('employee_profiles');
        }
      }
    } catch {}

    // 1b. Also sync current user's own profile from /employee-profile/me
    try {
      const meRes = await fetch(`${API_URL}/employee-profile/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (meRes.ok) {
        const meJson = await meRes.json();
        const meProfile: ProfileCompletionData = meJson.data || meJson;
        if (meProfile && (meProfile.userId || meProfile.userEmail)) {
          const local = getAllEmployeeProfiles();
          const merged = [...local];
          const idx = merged.findIndex(
            (p) =>
              String(p.userId) === String(meProfile.userId) ||
              (Boolean(meProfile.userEmail) &&
                p.userEmail?.toLowerCase() === meProfile.userEmail.toLowerCase())
          );
          if (idx >= 0) {
            merged[idx] = {
              ...merged[idx],
              ...meProfile,
              status: meProfile.status || merged[idx].status,
              employeeId: meProfile.employeeId || merged[idx].employeeId,
              completedSections: {
                ...(merged[idx].completedSections || {}),
                ...(meProfile.completedSections || {}),
              },
              personal:
                merged[idx].personal || meProfile.personal
                  ? {
                      fullName:
                        meProfile.personal?.fullName || merged[idx].personal?.fullName || '',
                      email:
                        meProfile.personal?.email ||
                        merged[idx].personal?.email ||
                        meProfile.userEmail ||
                        merged[idx].userEmail ||
                        '',
                      ...(merged[idx].personal || {}),
                      ...(meProfile.personal || {}),
                    }
                  : undefined,
              bank: meProfile.bank || merged[idx].bank,
              identity: meProfile.identity || merged[idx].identity,
            };
          } else {
            merged.push(meProfile);
          }
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));

          // Also update logged-in user in localStorage if matching
          try {
            const curUserRaw = localStorage.getItem('user');
            if (curUserRaw) {
              const curUser = JSON.parse(curUserRaw);
              if (
                String(curUser.id) === String(meProfile.userId) ||
                (meProfile.userEmail &&
                  curUser.email?.toLowerCase() === meProfile.userEmail.toLowerCase())
              ) {
                if (
                  meProfile.employeeId &&
                  (!curUser.employee_code || curUser.employee_code === 'N/A')
                ) {
                  curUser.employee_code = meProfile.employeeId;
                  curUser.employee_id = meProfile.employeeId;
                  curUser.employeeId = meProfile.employeeId;
                  localStorage.setItem('user', JSON.stringify(curUser));
                  window.dispatchEvent(new CustomEvent('auth_user_updated'));
                }
              }
            }
          } catch {}

          notifyChange('employee_profiles');
        }
      }
    } catch {}

    // 2. Sync registered users from /users endpoint
    try {
      const usersRes = await fetch(`${API_URL}/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (usersRes.ok) {
        const uJson = await usersRes.json();
        const uList = uJson.data || uJson;
        if (Array.isArray(uList) && uList.length > 0) {
          localStorage.setItem('aether_staff_list', JSON.stringify(uList));
          notifyChange('employee_profiles');
        }
      }
    } catch {}
  } catch {
    // Graceful offline fallback
  }
}

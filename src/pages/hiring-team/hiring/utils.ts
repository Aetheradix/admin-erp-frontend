import type { ProfileCompletionData } from '@/services/employeeProfileService';
import type { StaffMember } from '@/types/models';
import type { HiringMetrics, QuickSummaryItem } from './types';

export function canAssignEmployeeId(isSuperadmin: boolean, userRole: string): boolean {
  const normalizedUserRole = (userRole || '').toLowerCase().replace(/[\s_-]/g, '');
  return (
    isSuperadmin ||
    ['superadmin', 'admin', 'hradmin', 'hr', 'hiringmanager', 'hiringteam'].includes(
      normalizedUserRole
    ) ||
    ['SuperAdmin', 'Admin', 'HrAdmin'].includes(userRole)
  );
}

export function resolveProfileUserId(id: string | number, fallback?: number): number {
  if (typeof id === 'number') return id;
  return fallback ?? Date.now();
}

export function currentIsoTimestamp(): string {
  return new Date().toISOString();
}

export function mergeProfilesWithDbUsers(
  dbUsers: StaffMember[],
  profiles: ProfileCompletionData[]
): ProfileCompletionData[] {
  const list: ProfileCompletionData[] = [];
  const seenEmails = new Set<string>();
  const seenUserIds = new Set<string>();

  // 1. Process all registered users from database (/users)
  for (const dbUser of dbUsers) {
    if (!dbUser.email && !dbUser.id) continue;
    const emailLower = (dbUser.email || '').toLowerCase().trim();
    const userIdStr = String(dbUser.id);
    if (emailLower) seenEmails.add(emailLower);
    seenUserIds.add(userIdStr);

    // Match with existing onboarding profile if available
    const existingProfile = profiles.find(
      (p) =>
        String(p.userId) === userIdStr ||
        (Boolean(emailLower) && p.userEmail?.toLowerCase().trim() === emailLower)
    );

    if (existingProfile) {
      list.push({
        ...existingProfile,
        userId: resolveProfileUserId(dbUser.id, existingProfile.userId || undefined),
        userEmail: emailLower || existingProfile.userEmail,
        employeeId:
          existingProfile.employeeId &&
          existingProfile.employeeId !== 'N/A' &&
          existingProfile.employeeId !== 'NA'
            ? existingProfile.employeeId
            : dbUser.employee_id || dbUser.employee_code || undefined,
        role: existingProfile.role || dbUser.role || 'Employee',
        department: existingProfile.department || dbUser.department || '',
        designation: existingProfile.designation || dbUser.designation || '',
        personal: {
          ...existingProfile.personal,
          fullName:
            existingProfile.personal?.fullName ||
            dbUser.name ||
            dbUser.username ||
            'Unnamed Employee',
          email: emailLower || existingProfile.personal?.email || '',
          contactNumber:
            existingProfile.personal?.contactNumber || dbUser.contact_no || dbUser.phone || '',
        },
      });
    } else {
      // User registered in DB but hasn't submitted onboarding yet
      list.push({
        userId: resolveProfileUserId(dbUser.id),
        userEmail: emailLower,
        status: 'incomplete',
        employeeId: dbUser.employee_id || dbUser.employee_code,
        role: dbUser.role || 'Employee',
        department: dbUser.department || '',
        designation: dbUser.designation || '',
        completedSections: {},
        lastSavedAt: dbUser.join_date || dbUser.joinDate || currentIsoTimestamp(),
        personal: {
          fullName: dbUser.name || dbUser.username || 'Unnamed Employee',
          email: emailLower,
          contactNumber: dbUser.contact_no || dbUser.phone || '',
        },
      });
    }
  }

  // 2. Also preserve any local/seeded profiles not present in dbUsers (e.g., test candidates)
  for (const p of profiles) {
    const emailLower = (p.userEmail || '').toLowerCase().trim();
    const userIdStr = String(p.userId);
    if ((emailLower && seenEmails.has(emailLower)) || (userIdStr && seenUserIds.has(userIdStr))) {
      continue;
    }
    if (emailLower) seenEmails.add(emailLower);
    seenUserIds.add(userIdStr);
    list.push(p);
  }

  return list;
}

export function computeHiringMetrics(profiles: ProfileCompletionData[]): HiringMetrics {
  return {
    total: profiles.length,
    pending: profiles.filter((p) => p.status === 'submitted').length,
    changes: profiles.filter((p) => p.status === 'changes_required').length,
    approved: profiles.filter((p) => p.status === 'approved').length,
    assigned: profiles.filter((p) => p.status === 'id_assigned').length,
    onboarding: profiles.filter((p) => p.status === 'in_progress' || p.status === 'incomplete')
      .length,
  };
}

export function filterHiringProfiles(
  profiles: ProfileCompletionData[],
  searchQuery: string,
  activeTab: string
): ProfileCompletionData[] {
  return profiles.filter((p) => {
    const matchesSearch =
      p.personal?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'Pending Review') return p.status === 'submitted';
    if (activeTab === 'Changes Required') return p.status === 'changes_required';
    if (activeTab === 'Approved') return p.status === 'approved';
    if (activeTab === 'ID Assigned') return p.status === 'id_assigned';
    if (activeTab === 'Incomplete')
      return p.status === 'incomplete' || p.status === 'in_progress';
    return true;
  });
}

export function buildQuickSummary(profile: ProfileCompletionData): QuickSummaryItem[] {
  return [
    { label: 'Full Name', value: profile.personal?.fullName },
    { label: 'Assigned ID', value: profile.employeeId },
    { label: 'System Role', value: profile.role || 'Employee' },
    { label: 'Department', value: profile.department || 'Not Assigned' },
    { label: 'Designation', value: profile.designation || '—' },
    { label: 'Contact', value: profile.personal?.contactNumber },
    { label: 'Date of Birth', value: profile.personal?.dateOfBirth },
    { label: 'Gender', value: profile.personal?.gender },
    { label: 'Bank', value: profile.bank?.bankName },
    { label: 'Account Type', value: profile.bank?.accountType },
    { label: 'PAN Number', value: profile.identity?.panNumber },
    {
      label: 'Documents',
      value: profile.documents?.length ? `${profile.documents.length} file(s)` : 'None',
    },
    {
      label: 'Employment Entries',
      value: profile.employment?.length ? `${profile.employment.length} jobs` : 'None',
    },
    {
      label: 'Education Entries',
      value: profile.education?.length ? `${profile.education.length} qualifications` : 'None',
    },
    {
      label: 'Certifications',
      value: profile.certifications?.length ? `${profile.certifications.length} certs` : 'None',
    },
    {
      label: 'Submitted At',
      value: profile.submittedAt ? new Date(profile.submittedAt).toLocaleString() : 'Not yet',
    },
  ];
}

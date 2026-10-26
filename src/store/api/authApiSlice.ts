import { apiSlice } from './apiSlice';
import type { UserRole } from '@/config/navItems';

export interface AuditLog {
  id: string;
  targetUser: {
    name: string;
    email: string;
  };
  actionBy: {
    name: string;
    email: string;
  };
  action: 'APPROVED' | 'REJECTED';
  assignedRole?: UserRole;
  timestamp: string;
}

export interface InvitePayload {
  email: string;
  role: string;
}

export interface InviteResponse {
  link: string;
  tempPass: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    promoteToAdmin: builder.mutation({
      query: (userId) => ({
        url: '/auth/promote-to-admin',
        method: 'POST',
        body: { userId },
      }),
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
    }),
    requestOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/request-otp',
        method: 'POST',
        body: data,
      }),
    }),
    loginWithOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/login-otp',
        method: 'POST',
        body: data,
      }),
    }),
    sendInvitation: builder.mutation<{ message: string }, { email: string; role: UserRole }>({
      query: (credentials) => ({
        url: '/auth/send-invitation',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['ApprovalLogs', 'PendingUsers'],
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation<
      { message: string; success?: boolean },
      { currentPassword?: string; newPassword: string; logoutOtherSessions?: boolean }
    >({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getDepartments: builder.query({
      query: () => '/metadata/departments',
    }),
    requestAdminElevation: builder.mutation({
      query: (data) => ({
        url: '/auth/request-elevation',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getAdminElevationRequests: builder.query<any[], void>({
      query: () => '/auth/elevation-requests',
      providesTags: ['User'],
    }),
    processAdminElevation: builder.mutation({
      query: (data) => ({
        url: '/auth/elevation-requests/process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // --- PENDING USERS & APPROVALS ---
    getPendingUsers: builder.query<any, void>({
      query: () => '/auth/pending-users',
      providesTags: ['User'],
    }),

    approveAccount: builder.mutation<{ message: string }, { id: number; role: string }>({
      query: ({ id, role }) => ({
        url: `/auth/approve-account/${id}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User', 'ApprovalLogs'],
    }),

    rejectAccount: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/auth/reject-account/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User', 'ApprovalLogs'],
    }),

    // --- NEW: INVITATIONS & AUDIT LOGS ---
    generateInvitation: builder.mutation<InviteResponse, InvitePayload>({
      query: (data) => ({
        url: '/auth/generate-invitation',
        method: 'POST',
        body: data,
      }),
    }),

    getApprovalLogs: builder.query<AuditLog[], void>({
      query: () => '/auth/approval-logs',
      providesTags: ['ApprovalLogs'],
    }),

    getMyPermissions: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/auth/me/permissions',
      providesTags: ['User', 'Permissions'],
    }),

    // --- MANDATORY ONBOARDING ---
    changeTemporaryPassword: builder.mutation<
      { success: boolean; message: string; token: string; user: any },
      { currentPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: '/auth/change-temporary-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SystemAuditLogs'],
    }),

    completeOnboarding: builder.mutation<
      { success: boolean; message: string; token: string; user: any },
      {
        username?: string;
        contact_number?: string;
        department?: string;
        designation?: string;
      }
    >({
      query: (data) => ({
        url: '/auth/complete-onboarding',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'SystemInvitations', 'SystemAuditLogs', 'ApprovalLogs'],
    }),

    getOnboardingStatus: builder.query<
      {
        success: boolean;
        data: { is_temporary_password: boolean; is_onboarded: boolean; onboarding_step: number };
      },
      void
    >({
      query: () => '/auth/onboarding-status',
    }),

    // --- SYSTEM AUDIT LOGS (backend MySQL) ---
    getSystemAuditLogs: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/audit-logs',
      providesTags: ['SystemAuditLogs'],
    }),

    createSystemAuditLog: builder.mutation<
      { success: boolean; data: any },
      {
        action: string;
        category: string;
        user?: string;
        userEmail?: string;
        target: string;
        targetEmail?: string;
        status?: string;
        details?: string;
        changes?: Array<{ field: string; from: any; to: any }>;
      }
    >({
      query: (data) => ({
        url: '/audit-logs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SystemAuditLogs'],
    }),

    // --- SYSTEM INVITATIONS (backend MySQL) ---
    getSystemInvitations: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/invitations',
      providesTags: ['SystemInvitations'],
    }),

    createSystemInvitation: builder.mutation<
      { success: boolean; data: any },
      {
        email: string;
        name: string;
        role: string;
        department: string;
        invitedBy?: { name: string; email: string; role: string };
        customExpiryDays?: number;
        tempPassword?: string;
      }
    >({
      query: (data) => ({
        url: '/invitations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SystemInvitations', 'SystemAuditLogs'],
    }),

    revokeSystemInvitation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/invitations/revoke/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['SystemInvitations', 'SystemAuditLogs'],
    }),

    resendSystemInvitation: builder.mutation<
      { success: boolean; token?: string; tempPassword?: string },
      string
    >({
      query: (id) => ({
        url: `/invitations/resend/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['SystemInvitations', 'SystemAuditLogs'],
    }),

    acceptSystemInvitation: builder.mutation<{ success: boolean }, { token: string; profile: any }>(
      {
        query: (data) => ({
          url: '/invitations/accept',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['SystemInvitations', 'SystemAuditLogs', 'User', 'ApprovalLogs'],
      }
    ),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  usePromoteToAdminMutation,
  useUpdateProfileMutation,
  useApproveAccountMutation,
  useGetPendingUsersQuery,
  useRejectAccountMutation,
  useRequestOTPMutation,
  useLoginWithOTPMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetDepartmentsQuery,
  useRequestAdminElevationMutation,
  useGetAdminElevationRequestsQuery,
  useProcessAdminElevationMutation,
  useLogoutMutation,
  // Export new hooks
  useGenerateInvitationMutation,
  useGetApprovalLogsQuery,
  useSendInvitationMutation,
  useGetMyPermissionsQuery,
  useLazyGetMyPermissionsQuery,
  // Onboarding hooks
  useChangeTemporaryPasswordMutation,
  useCompleteOnboardingMutation,
  useGetOnboardingStatusQuery,
  // System Audit Logs (backend)
  useGetSystemAuditLogsQuery,
  useCreateSystemAuditLogMutation,
  // System Invitations (backend)
  useGetSystemInvitationsQuery,
  useCreateSystemInvitationMutation,
  useRevokeSystemInvitationMutation,
  useResendSystemInvitationMutation,
  useAcceptSystemInvitationMutation,
} = authApiSlice;

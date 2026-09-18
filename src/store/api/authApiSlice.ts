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
  useGetDepartmentsQuery,
  useRequestAdminElevationMutation,
  useGetAdminElevationRequestsQuery,
  useProcessAdminElevationMutation,
  useLogoutMutation,
  // Export new hooks
  useGenerateInvitationMutation,
  useGetApprovalLogsQuery,
  useSendInvitationMutation,
} = authApiSlice;

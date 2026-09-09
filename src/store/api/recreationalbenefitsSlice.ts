import type {
  RecreationalBenefit,
  RecreationalBenefitAssignment,
  RecreationalBenefitUsage,
  RecreationalBenefitStats,
  CreateRecreationalBenefitRequest,
  UpdateRecreationalBenefitRequest,
  AssignRecreationalBenefitRequest,
  RecordRecreationalBenefitUsageRequest,
} from '@/types/recreationalBenefits';

import { apiSlice } from './apiSlice';

export const recreationalBenefitsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // Get All Benefits
    // ==========================================

    getRecreationalBenefits: builder.query<
      RecreationalBenefit[],
      {
        search?: string;
        status?: string;
        benefit_type?: string;
      } | void
    >({
      query: (params) => ({
        url: '/recreational-benefits',
        params,
      }),

      transformResponse: (response: unknown) => {
        const data =
          (
            response as {
              data?: unknown[];
            }
          )?.data ?? response;

        return Array.isArray(data) ? (data as RecreationalBenefit[]) : [];
      },

      providesTags: ['RecreationalBenefit'],
    }),

    // ==========================================
    // Get Single Benefit
    // ==========================================

    getRecreationalBenefit: builder.query<RecreationalBenefit, number>({
      query: (id) => `/recreational-benefits/${id}`,

      transformResponse: (response: unknown) => {
        const data =
          (
            response as {
              data?: RecreationalBenefit;
            }
          )?.data ?? response;

        return data as RecreationalBenefit;
      },

      providesTags: (result, error, id) => [
        {
          type: 'RecreationalBenefit',
          id,
        },
      ],
    }),

    // ==========================================
    // Get Active Benefits
    // ==========================================

    getActiveRecreationalBenefits: builder.query<RecreationalBenefit[], void>({
      query: () => '/recreational-benefits/active',

      transformResponse: (response: unknown) => {
        const data =
          (
            response as {
              data?: unknown[];
            }
          )?.data ?? response;

        return Array.isArray(data) ? (data as RecreationalBenefit[]) : [];
      },

      providesTags: ['RecreationalBenefit'],
    }),

    getRecreationalBenefitUsageByBenefit: builder.query<RecreationalBenefitUsage[], number>({
      query: (benefitId) => `/recreational-benefits/${benefitId}/usage`,

      transformResponse: (response: unknown) => {
        const data =
          (
            response as {
              data?: unknown[];
            }
          )?.data ?? response;

        return Array.isArray(data) ? (data as RecreationalBenefitUsage[]) : [];
      },

      providesTags: ['RecreationalBenefitUsage'],
    }),

    // ==========================================
    // Create Benefit
    // ==========================================

    createRecreationalBenefit: builder.mutation<
      {
        success: boolean;
        message: string;
        data: RecreationalBenefit;
      },
      CreateRecreationalBenefitRequest
    >({
      query: (body) => ({
        url: '/recreational-benefits',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['RecreationalBenefit'],
    }),

    // ==========================================
    // Update Benefit
    // ==========================================

    updateRecreationalBenefit: builder.mutation<
      {
        success: boolean;
        message: string;
        data: RecreationalBenefit;
      },
      {
        id: number;
        data: UpdateRecreationalBenefitRequest;
      }
    >({
      query: ({ id, data }) => ({
        url: `/recreational-benefits/${id}`,
        method: 'PUT',
        body: data,
      }),

      invalidatesTags: (result, error, { id }) => [
        'RecreationalBenefit',
        {
          type: 'RecreationalBenefit',
          id,
        },
      ],
    }),

    // ==========================================
    // Delete Benefit
    // ==========================================

    deleteRecreationalBenefit: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      number
    >({
      query: (id) => ({
        url: `/recreational-benefits/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['RecreationalBenefit'],
    }),

    // ==========================================
    // Activate Benefit
    // ==========================================

    activateRecreationalBenefit: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      number
    >({
      query: (id) => ({
        url: `/recreational-benefits/${id}/activate`,
        method: 'PATCH',
      }),

      invalidatesTags: ['RecreationalBenefit'],
    }),

    // ==========================================
    // Deactivate Benefit
    // ==========================================

    deactivateRecreationalBenefit: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      number
    >({
      query: (id) => ({
        url: `/recreational-benefits/${id}/deactivate`,
        method: 'PATCH',
      }),

      invalidatesTags: ['RecreationalBenefit'],
    }),

    // ==========================================
    // Get My Benefits
    // ==========================================

    getMyRecreationalBenefits: builder.query<RecreationalBenefitAssignment[], void>({
      query: () => '/recreational-benefits/my-benefits',

      transformResponse: (response: unknown) => {
        const data =
          (
            response as {
              data?: unknown[];
            }
          )?.data ?? response;

        return Array.isArray(data) ? (data as RecreationalBenefitAssignment[]) : [];
      },

      providesTags: ['MyRecreationalBenefit'],
    }),

    // ==========================================
    // Assign Benefit
    // ==========================================

    assignRecreationalBenefit: builder.mutation<
      {
        success: boolean;
        message: string;
        data: RecreationalBenefitAssignment;
      },
      {
        id: number;
        data: AssignRecreationalBenefitRequest;
      }
    >({
      query: ({ id, data }) => ({
        url: `/recreational-benefits/${id}/assign`,
        method: 'POST',
        body: data,
      }),

      invalidatesTags: [
        'RecreationalBenefit',
        'MyRecreationalBenefit',
        'RecreationalBenefitAssignment',
      ],
    }),

    // ==========================================
    // Get Assignments
    // ==========================================

    getRecreationalBenefitAssignments: builder.query<RecreationalBenefitAssignment[], number>({
      query: (id) => `/recreational-benefits/${id}/assignments`,

      transformResponse: (response: unknown) => {
        const data =
          (
            response as {
              data?: unknown[];
            }
          )?.data ?? response;

        return Array.isArray(data) ? (data as RecreationalBenefitAssignment[]) : [];
      },

      providesTags: ['RecreationalBenefitAssignment'],
    }),

    // ==========================================
    // Revoke Assignment
    // ==========================================

    revokeRecreationalBenefit: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      number
    >({
      query: (assignmentId) => ({
        url: `/recreational-benefits/assignments/${assignmentId}`,
        method: 'DELETE',
      }),

      invalidatesTags: [
        'RecreationalBenefit',
        'MyRecreationalBenefit',
        'RecreationalBenefitAssignment',
      ],
    }),

    // ==========================================
    // Get Usage
    // ==========================================

    getRecreationalBenefitUsage: builder.query<RecreationalBenefitUsage[], number>({
      query: (assignmentId) => `/recreational-benefits/assignments/${assignmentId}/usage`,

      transformResponse: (response: unknown) => {
        const data =
          (
            response as {
              data?: unknown[];
            }
          )?.data ?? response;

        return Array.isArray(data) ? (data as RecreationalBenefitUsage[]) : [];
      },

      providesTags: ['RecreationalBenefitUsage'],
    }),

    // ==========================================
    // Record Usage
    // ==========================================

    recordRecreationalBenefitUsage: builder.mutation<
      {
        success: boolean;
        message: string;
        data: RecreationalBenefitUsage;
      },
      {
        assignmentId: number;
        data: RecordRecreationalBenefitUsageRequest;
      }
    >({
      query: ({ assignmentId, data }) => ({
        url: `/recreational-benefits/assignments/${assignmentId}/usage`,
        method: 'POST',
        body: data,
      }),

      invalidatesTags: ['RecreationalBenefitUsage', 'MyRecreationalBenefit'],
    }),

    // ==========================================
    // Approve Usage
    // ==========================================

    approveRecreationalBenefitUsage: builder.mutation<
      {
        success: boolean;
        message: string;
        data: RecreationalBenefitUsage;
      },
      number
    >({
      query: (usageId) => ({
        url: `/recreational-benefits/usage/${usageId}/approve`,
        method: 'PATCH',
      }),

      invalidatesTags: ['RecreationalBenefitUsage', 'MyRecreationalBenefit'],
    }),

    // ==========================================
    // Reject Usage
    // ==========================================

    rejectRecreationalBenefitUsage: builder.mutation<
      {
        success: boolean;
        message: string;
        data: RecreationalBenefitUsage;
      },
      {
        usageId: number;
        rejection_reason?: string;
      }
    >({
      query: ({ usageId, rejection_reason }) => ({
        url: `/recreational-benefits/usage/${usageId}/reject`,
        method: 'PATCH',
        body: {
          rejection_reason,
        },
      }),

      invalidatesTags: ['RecreationalBenefitUsage', 'MyRecreationalBenefit'],
    }),

    // ==========================================
    // Statistics
    // ==========================================

    getRecreationalBenefitStats: builder.query<RecreationalBenefitStats, void>({
      query: () => '/recreational-benefits/stats',

      transformResponse: (response: unknown) => {
        const data =
          (
            response as {
              data?: RecreationalBenefitStats;
            }
          )?.data ?? response;

        return (data ?? {}) as RecreationalBenefitStats;
      },

      providesTags: [
        'RecreationalBenefit',
        'RecreationalBenefitAssignment',
        'RecreationalBenefitUsage',
      ],
    }),
  }),
});

export const {
  // Benefits
  useGetRecreationalBenefitsQuery,
  useGetRecreationalBenefitQuery,
  useGetRecreationalBenefitQuery: useGetRecreationalBenefitByIdQuery, // Alias added here!
  useGetActiveRecreationalBenefitsQuery,

  useCreateRecreationalBenefitMutation,
  useUpdateRecreationalBenefitMutation,
  useDeleteRecreationalBenefitMutation,

  useActivateRecreationalBenefitMutation,
  useDeactivateRecreationalBenefitMutation,

  // Assignments
  useGetMyRecreationalBenefitsQuery,
  useAssignRecreationalBenefitMutation,
  useGetRecreationalBenefitAssignmentsQuery,
  useRevokeRecreationalBenefitMutation,
  useRevokeRecreationalBenefitMutation: useRevokeRecreationalBenefitAssignmentMutation, // Alias added here!

  // Usage
  useGetRecreationalBenefitUsageQuery,
  useRecordRecreationalBenefitUsageMutation,

  useApproveRecreationalBenefitUsageMutation,
  useRejectRecreationalBenefitUsageMutation,
  useGetRecreationalBenefitUsageByBenefitQuery,

  // Statistics
  useGetRecreationalBenefitStatsQuery,
} = recreationalBenefitsSlice;

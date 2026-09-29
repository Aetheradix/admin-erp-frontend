import { apiSlice } from './apiSlice';
import type {
  Perk,
  PerkType,
  UserPerk,
  CreatePerkRequest,
  UpdatePerkRequest,
  CreatePerkTypeRequest,
  UpdatePerkTypeRequest,
  AssignPerkRequest as BaseAssignPerkRequest,
  UpdateUserPerkRequest,
  PerkMutationResponse,
  PerkTypeMutationResponse,
  UserPerkMutationResponse,
} from '../../pages/benefits/types/perks.types';

export interface AssignPerkRequest extends BaseAssignPerkRequest {
  createExpense?: boolean;
}

export interface RecordPerkUsageRequest {
  userPerkId: number;
  user_id?: number;
  amount?: number;
  currency?: string;
  title?: string;
  description?: string;
  vendor_name?: string;
}

export interface RecordPerkUsageResponse {
  success: boolean;
  message: string;
  data: {
    user_perk_id: number;
    expense_id: number;
    amount: number;
    currency: string;
  };
}

export interface PerkExpense {
  expense_id: number;
  user_id: number;
  employee_name: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  status: string;
  vendor_name: string;
  description: string;
  created_at: string;
}

export interface GetPerkExpensesParams {
  user_id?: number;
  category?: string;
  status?: string;
}

export interface LinkPerkToExpenseRequest {
  expenseId: number;
  perkTitle?: string;
  categoryName?: string;
}

export interface LinkPerkToExpenseResponse {
  success: boolean;
  message: string;
  data: {
    expense_id: number;
  };
}

export const benefitsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPerks: builder.query<Perk[], void>({
      query: () => '/perks',

      transformResponse: (response: unknown) => {
        const data = (response as { data?: Perk[] })?.data ?? response;

        return Array.isArray(data) ? data : [];
      },

      providesTags: ['Perks'],
    }),

    getPerkById: builder.query<Perk, number>({
      query: (id) => `/perks/${id}`,

      transformResponse: (response: unknown) => {
        return (response as { data?: Perk })?.data ?? (response as Perk);
      },

      providesTags: (_result, _error, id) => [{ type: 'Perks', id }],
    }),

    createPerk: builder.mutation<PerkMutationResponse, CreatePerkRequest>({
      query: (body) => ({
        url: '/perks',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['Perks'],
    }),

    updatePerk: builder.mutation<PerkMutationResponse, UpdatePerkRequest>({
      query: ({ id, data }) => ({
        url: `/perks/${id}`,
        method: 'PUT',
        body: data,
      }),

      invalidatesTags: (_result, _error, { id }) => ['Perks', { type: 'Perks', id }],
    }),

    deletePerk: builder.mutation<PerkMutationResponse, number>({
      query: (id) => ({
        url: `/perks/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['Perks'],
    }),

    getPerkTypes: builder.query<PerkType[], void>({
      query: () => '/perk-types',

      transformResponse: (response: unknown) => {
        const data = (response as { data?: PerkType[] })?.data ?? response;

        return Array.isArray(data) ? data : [];
      },

      providesTags: ['PerkTypes'],
    }),

    createPerkType: builder.mutation<PerkTypeMutationResponse, CreatePerkTypeRequest>({
      query: (body) => ({
        url: '/perk-types',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['PerkTypes'],
    }),

    updatePerkType: builder.mutation<PerkTypeMutationResponse, UpdatePerkTypeRequest>({
      query: ({ id, data }) => ({
        url: `/perk-types/${id}`,
        method: 'PUT',
        body: data,
      }),

      invalidatesTags: (_result, _error, { id }) => ['PerkTypes', { type: 'PerkTypes', id }],
    }),

    deletePerkType: builder.mutation<PerkTypeMutationResponse, number>({
      query: (id) => ({
        url: `/perk-types/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['PerkTypes'],
    }),

    assignPerk: builder.mutation<UserPerkMutationResponse, AssignPerkRequest>({
      query: ({ perkId, user_id, valid_from, valid_until, createExpense }) => ({
        url: `/perks/${perkId}/assign`,
        method: 'POST',
        body: {
          user_id,
          valid_from,
          valid_until,
          createExpense,
        },
      }),

      invalidatesTags: ['Perks', 'UserPerks', 'PerkExpenses'],
    }),

    recordPerkUsage: builder.mutation<RecordPerkUsageResponse, RecordPerkUsageRequest>({
      query: ({ userPerkId, ...data }) => ({
        url: `/user-perks/${userPerkId}/use`,
        method: 'POST',
        body: data,
      }),

      invalidatesTags: ['UserPerks', 'PerkExpenses'],
    }),

    getUserPerks: builder.query<UserPerk[], number | void>({
      query: (userId) => (userId ? `/users/${userId}/perks` : '/users/perks'),

      transformResponse: (response: unknown) => {
        const data = (response as { data?: UserPerk[] })?.data ?? response;

        return Array.isArray(data) ? data : [];
      },

      providesTags: ['UserPerks'],
    }),

    updateUserPerk: builder.mutation<UserPerkMutationResponse, UpdateUserPerkRequest>({
      query: ({ id, data }) => ({
        url: `/user-perks/${id}`,
        method: 'PUT',
        body: data,
      }),

      invalidatesTags: ['UserPerks', 'Perks'],
    }),
    getPerkExpenses: builder.query<PerkExpense[], GetPerkExpensesParams | void>({
      query: (params) => ({
        url: '/perks/expenses',
        params: params ?? undefined,
      }),

      transformResponse: (response: unknown) => {
        const data = (response as { data?: PerkExpense[] })?.data ?? response;

        return Array.isArray(data) ? data : [];
      },

      providesTags: ['PerkExpenses'],
    }),

    linkPerkToExpense: builder.mutation<LinkPerkToExpenseResponse, LinkPerkToExpenseRequest>({
      query: ({ expenseId, perkTitle, categoryName }) => ({
        url: `/expenses/${expenseId}/link-perk`,
        method: 'PATCH',
        body: { perkTitle, categoryName },
      }),

      invalidatesTags: ['PerkExpenses'],
    }),
  }),
});

export type {
  Perk,
  PerkType,
  UserPerk,
  CreatePerkRequest,
  UpdatePerkRequest,
  CreatePerkTypeRequest,
  UpdatePerkTypeRequest,
  UpdateUserPerkRequest,
} from '@/pages/benefits/types/perks.types';

export const {
  // Perks
  useGetPerksQuery,
  useGetPerkByIdQuery,
  useCreatePerkMutation,
  useUpdatePerkMutation,
  useDeletePerkMutation,

  // Perk types
  useGetPerkTypesQuery,
  useCreatePerkTypeMutation,
  useUpdatePerkTypeMutation,
  useDeletePerkTypeMutation,

  // User perks & usage
  useAssignPerkMutation,
  useRecordPerkUsageMutation,
  useGetUserPerksQuery,
  useUpdateUserPerkMutation,

  // Perk expenses
  useGetPerkExpensesQuery,
  useLinkPerkToExpenseMutation,
} = benefitsSlice;

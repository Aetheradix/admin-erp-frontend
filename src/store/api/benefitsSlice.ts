import { apiSlice } from './apiSlice';
import type {
  Perk,
  PerkType,
  UserPerk,
  CreatePerkRequest,
  UpdatePerkRequest,
  CreatePerkTypeRequest,
  UpdatePerkTypeRequest,
  AssignPerkRequest,
  UpdateUserPerkRequest,
  PerkMutationResponse,
  PerkTypeMutationResponse,
  UserPerkMutationResponse,
} from '../../pages/benefits/types/perks.types';

export const benefitsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // PERKS
    // =========================================================

    /**
     * Get all perks
     * GET /perks
     */
    getPerks: builder.query<Perk[], void>({
      query: () => '/perks',

      transformResponse: (response: unknown) => {
        const data = (response as { data?: Perk[] })?.data ?? response;

        return Array.isArray(data) ? data : [];
      },

      providesTags: ['Perks'],
    }),

    /**
     * Get perk by ID
     * GET /perks/:id
     */
    getPerkById: builder.query<Perk, number>({
      query: (id) => `/perks/${id}`,

      transformResponse: (response: unknown) => {
        return (response as { data?: Perk })?.data ?? (response as Perk);
      },

      providesTags: (_result, _error, id) => [{ type: 'Perks', id }],
    }),

    /**
     * Create perk
     * POST /perks
     */
    createPerk: builder.mutation<PerkMutationResponse, CreatePerkRequest>({
      query: (body) => ({
        url: '/perks',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['Perks'],
    }),

    /**
     * Update perk
     * PUT /perks/:id
     */
    updatePerk: builder.mutation<PerkMutationResponse, UpdatePerkRequest>({
      query: ({ id, data }) => ({
        url: `/perks/${id}`,
        method: 'PUT',
        body: data,
      }),

      invalidatesTags: (_result, _error, { id }) => ['Perks', { type: 'Perks', id }],
    }),

    /**
     * Deactivate perk
     * DELETE /perks/:id
     */
    deletePerk: builder.mutation<PerkMutationResponse, number>({
      query: (id) => ({
        url: `/perks/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['Perks'],
    }),

    // =========================================================
    // PERK TYPES
    // =========================================================

    /**
     * Get all perk types
     * GET /perk-types
     */
    getPerkTypes: builder.query<PerkType[], void>({
      query: () => '/perk-types',

      transformResponse: (response: unknown) => {
        const data = (response as { data?: PerkType[] })?.data ?? response;

        return Array.isArray(data) ? data : [];
      },

      providesTags: ['PerkTypes'],
    }),

    /**
     * Create perk type
     * POST /perk-types
     */
    createPerkType: builder.mutation<PerkTypeMutationResponse, CreatePerkTypeRequest>({
      query: (body) => ({
        url: '/perk-types',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['PerkTypes'],
    }),

    /**
     * Update perk type
     * PUT /perk-types/:id
     */
    updatePerkType: builder.mutation<PerkTypeMutationResponse, UpdatePerkTypeRequest>({
      query: ({ id, data }) => ({
        url: `/perk-types/${id}`,
        method: 'PUT',
        body: data,
      }),

      invalidatesTags: (_result, _error, { id }) => ['PerkTypes', { type: 'PerkTypes', id }],
    }),

    /**
     * Deactivate perk type
     * DELETE /perk-types/:id
     */
    deletePerkType: builder.mutation<PerkTypeMutationResponse, number>({
      query: (id) => ({
        url: `/perk-types/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['PerkTypes'],
    }),

    // =========================================================
    // ASSIGN PERK
    // =========================================================

    /**
     * Assign perk to user
     * POST /perks/:perkId/assign
     */
    assignPerk: builder.mutation<UserPerkMutationResponse, AssignPerkRequest>({
      query: ({ perkId, user_id, valid_from, valid_until }) => ({
        url: `/perks/${perkId}/assign`,
        method: 'POST',
        body: {
          user_id,
          valid_from,
          valid_until,
        },
      }),

      invalidatesTags: ['Perks', 'UserPerks'],
    }),

    // =========================================================
    // USER PERKS
    // =========================================================

    /**
     * Get user's perks
     *
     * If userId is supplied:
     * GET /users/:userId/perks
     *
     * If omitted:
     * GET /users/perks
     *
     * IMPORTANT:
     * Adjust this URL to your actual route definition.
     */
    getUserPerks: builder.query<UserPerk[], number | void>({
      query: (userId) => (userId ? `/users/${userId}/perks` : '/users/perks'),

      transformResponse: (response: unknown) => {
        const data = (response as { data?: UserPerk[] })?.data ?? response;

        return Array.isArray(data) ? data : [];
      },

      providesTags: ['UserPerks'],
    }),

    /**
     * Update user's perk
     * PUT /user-perks/:id
     */
    updateUserPerk: builder.mutation<UserPerkMutationResponse, UpdateUserPerkRequest>({
      query: ({ id, data }) => ({
        url: `/user-perks/${id}`,
        method: 'PUT',
        body: data,
      }),

      invalidatesTags: ['UserPerks', 'Perks'],
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
  AssignPerkRequest,
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

  // User perks
  useAssignPerkMutation,
  useGetUserPerksQuery,
  useUpdateUserPerkMutation,
} = benefitsSlice;

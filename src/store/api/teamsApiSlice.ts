import { apiSlice } from './apiSlice';

export interface Team {
  id: number;
  name: string;
  department: string;
  description?: string;
  manager_id?: number;
  manager_name?: string;
  manager_role?: string;
  manager_designation?: string;
  color: string;
  status: string;
  created_at?: string;
  member_count: number;
  project_count: number;
}

export interface TeamMember {
  id: number;
  username?: string;
  name?: string;
  email: string;
  role?: string;
  designation?: string;
  department?: string;
  image_url?: string;
  image?: string;
  assigned_at?: string;
}

export interface CreateTeamPayload {
  name: string;
  department: string;
  description?: string;
  manager_id?: number;
  color?: string;
  status?: string;
}

export interface UpdateTeamPayload extends Partial<CreateTeamPayload> {
  id: number;
}

export const teamsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<Team[], void>({
      query: () => '/teams',
      providesTags: ['Teams'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? (data as Team[]) : [];
      },
    }),
    getTeamById: builder.query<Team, number>({
      query: (id) => `/teams/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Teams', id }],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown })?.data ?? response;
        return data as Team;
      },
    }),
    createTeam: builder.mutation<Team, CreateTeamPayload>({
      query: (body) => ({ url: '/teams', method: 'POST', body }),
      invalidatesTags: ['Teams', 'OrganizationHierarchy', 'User'],
    }),
    updateTeam: builder.mutation<Team, UpdateTeamPayload>({
      query: ({ id, ...body }) => ({ url: `/teams/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _err, { id }) => [
        'Teams',
        { type: 'Teams', id },
        'OrganizationHierarchy',
        'User',
      ],
    }),
    deleteTeam: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/teams/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Teams', 'OrganizationHierarchy', 'User'],
    }),
    getTeamMembers: builder.query<TeamMember[], number>({
      query: (teamId) => `/teams/${teamId}/members`,
      providesTags: (_result, _err, teamId) => [{ type: 'TeamMembers', id: teamId }],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? (data as TeamMember[]) : [];
      },
    }),
    addTeamMember: builder.mutation<unknown, { teamId: number; userId: number }>({
      query: ({ teamId, userId }) => ({
        url: `/teams/${teamId}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (_result, _err, { teamId }) => [
        'Teams',
        { type: 'TeamMembers', id: teamId },
        'OrganizationHierarchy',
        'User',
      ],
    }),
    removeTeamMember: builder.mutation<unknown, { teamId: number; userId: number }>({
      query: ({ teamId, userId }) => ({
        url: `/teams/${teamId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { teamId }) => [
        'Teams',
        { type: 'TeamMembers', id: teamId },
        'OrganizationHierarchy',
        'User',
      ],
    }),
    changeTeamManager: builder.mutation<unknown, { teamId: number; managerId: number }>({
      query: ({ teamId, managerId }) => ({
        url: `/teams/${teamId}/manager`,
        method: 'PUT',
        body: { managerId },
      }),
      invalidatesTags: (_result, _err, { teamId }) => [
        'Teams',
        { type: 'Teams', id: teamId },
        { type: 'TeamMembers', id: teamId },
        'OrganizationHierarchy',
        'User',
      ],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useGetTeamMembersQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useChangeTeamManagerMutation,
} = teamsApiSlice;

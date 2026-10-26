import { apiSlice } from './apiSlice';

/**
 * Employee Profile Completion API Slice
 * Endpoints for managing employee profile completion, document uploads,
 * form configuration, and employee ID assignment.
 */
export const employeeProfileApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── Get own profile completion status ──
    getMyProfileCompletion: builder.query<
      {
        success: boolean;
        data: any;
      },
      void
    >({
      query: () => '/employee-profile/me',
      providesTags: ['EmployeeProfile'],
    }),

    // ── Get profile completion for any employee (Hiring Team) ──
    getEmployeeProfileById: builder.query<
      {
        success: boolean;
        data: any;
      },
      number | string
    >({
      query: (userId) => `/employee-profile/${userId}`,
      providesTags: (_, __, id) => [{ type: 'EmployeeProfile', id }],
    }),

    // ── Get all employee profiles (HR/Admin view) ──
    getAllEmployeeProfiles: builder.query<
      {
        success: boolean;
        data: any[];
      },
      void
    >({
      query: () => '/employee-profile',
      providesTags: ['EmployeeProfile'],
    }),

    // ── Update personal section ──
    updatePersonalDetails: builder.mutation<
      {
        success: boolean;
        message: string;
        data: any;
      },
      { section: string; data: any }
    >({
      query: ({ section, data }) => ({
        url: `/employee-profile/section/${section}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EmployeeProfile'],
    }),

    // ── Submit profile for review ──
    submitProfileForReview: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      void
    >({
      query: () => ({
        url: '/employee-profile/submit',
        method: 'POST',
      }),
      invalidatesTags: ['EmployeeProfile', 'SystemAuditLogs'],
    }),

    // ── Approve a profile (Hiring Team) ──
    approveEmployeeProfile: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      { userId: number; notes?: string }
    >({
      query: ({ userId, notes }) => ({
        url: `/employee-profile/${userId}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['EmployeeProfile', 'SystemAuditLogs'],
    }),

    // ── Request changes (Hiring Team) ──
    requestProfileChanges: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      { userId: number; notes: string }
    >({
      query: ({ userId, notes }) => ({
        url: `/employee-profile/${userId}/request-changes`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['EmployeeProfile', 'SystemAuditLogs'],
    }),

    // ── Assign Employee ID (Admin/SuperAdmin only) ──
    assignEmployeeId: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      { userId: number; employeeId: string }
    >({
      query: ({ userId, employeeId }) => ({
        url: `/employee-profile/${userId}/assign-id`,
        method: 'POST',
        body: { employeeId },
      }),
      invalidatesTags: ['EmployeeProfile', 'SystemAuditLogs'],
    }),

    // ── Upload profile document ──
    uploadProfileDocument: builder.mutation<
      {
        success: boolean;
        message: string;
        data: { url: string; id: string };
      },
      { file: File; type: string; label: string }
    >({
      query: ({ file, type, label }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('label', label);
        formData.append('category', 'employee_documents');
        return {
          url: '/employee-profile/documents/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['EmployeeProfile'],
    }),

    // ── Upload profile picture ──
    uploadProfilePicture: builder.mutation<
      {
        success: boolean;
        message: string;
        data: { url: string };
      },
      File
    >({
      query: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', 'users');
        return {
          url: '/uploads/image',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['EmployeeProfile', 'User'],
    }),

    // ── Get form configuration ──
    getFormConfiguration: builder.query<
      {
        success: boolean;
        data: any[];
      },
      void
    >({
      query: () => '/employee-profile/form-config',
      providesTags: ['ProfileFormConfig'],
    }),

    // ── Save form configuration (Hiring Team) ──
    saveFormConfiguration: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      { sections: any[] }
    >({
      query: ({ sections }) => ({
        url: '/employee-profile/form-config',
        method: 'PUT',
        body: { sections },
      }),
      invalidatesTags: ['ProfileFormConfig', 'SystemAuditLogs'],
    }),
  }),
});

export const {
  useGetMyProfileCompletionQuery,
  useGetEmployeeProfileByIdQuery,
  useGetAllEmployeeProfilesQuery,
  useUpdatePersonalDetailsMutation,
  useSubmitProfileForReviewMutation,
  useApproveEmployeeProfileMutation,
  useRequestProfileChangesMutation,
  useAssignEmployeeIdMutation,
  useUploadProfileDocumentMutation,
  useUploadProfilePictureMutation,
  useGetFormConfigurationQuery,
  useSaveFormConfigurationMutation,
} = employeeProfileApiSlice;

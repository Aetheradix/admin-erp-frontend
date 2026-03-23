import { apiSlice } from './apiSlice';

export const careerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCareers: builder.query<any[], void>({
      query: () => '/careers',
      providesTags: ['Career'],
    }),
    createCareer: builder.mutation<any, any>({
      query: (career) => ({
        url: '/careers',
        method: 'POST',
        body: career,
      }),
      invalidatesTags: ['Career'],
    }),
    updateCareer: builder.mutation<any, any>({
      query: (career) => ({
        url: `/careers/${career.id || career.key}`,
        method: 'PUT',
        body: career,
      }),
      invalidatesTags: ['Career'],
    }),
    deleteCareer: builder.mutation<any, string>({
      query: (id) => ({
        url: `/careers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Career'],
    }),
  }),
});

export const {
  useGetCareersQuery,
  useCreateCareerMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
} = careerSlice;

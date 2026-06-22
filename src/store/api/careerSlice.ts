import type { Career } from '@/types/models';
import { apiSlice } from './apiSlice';

export const careerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCareers: builder.query<Career[], void>({
      query: () => '/careers',
      providesTags: ['Career'],
    }),
    createCareer: builder.mutation<Career, Partial<Career>>({
      query: (career) => ({
        url: '/careers',
        method: 'POST',
        body: career,
      }),
      invalidatesTags: ['Career'],
    }),
    updateCareer: builder.mutation<Career, Partial<Career> & { id: string | number }>({
      query: (career) => ({
        url: `/careers/${career.id}`,
        method: 'PUT',
        body: career,
      }),
      invalidatesTags: ['Career'],
    }),
    deleteCareer: builder.mutation<{ success: boolean }, string | number>({
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

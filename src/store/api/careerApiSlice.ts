import type { Career } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapCareer } from './mappers';

export type { Career };

export const careerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCareers: builder.query<Career[], void>({
      query: () => '/careers',
      providesTags: ['Career'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapCareer(item as Record<string, unknown>))
          : [];
      },
    }),
    createCareer: builder.mutation<Career, Partial<Career>>({
      query: (careerData) => ({
        url: '/careers',
        method: 'POST',
        body: {
          ...careerData,
          requirements: JSON.stringify(careerData.requirements || []),
          benefits: JSON.stringify(careerData.benefits || []),
          posted_date: careerData.postedDate || new Date().toISOString().split('T')[0],
        },
      }),
      invalidatesTags: ['Career'],
    }),
    updateCareer: builder.mutation<Career, Partial<Career> & { id: string | number }>({
      query: (careerData) => ({
        url: `/careers/${careerData.id}`,
        method: 'PUT',
        body: {
          ...careerData,
          requirements: JSON.stringify(careerData.requirements || []),
          benefits: JSON.stringify(careerData.benefits || []),
        },
      }),
      invalidatesTags: ['Career'],
    }),
    deleteCareer: builder.mutation<{ success?: boolean }, string>({
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
} = careerApiSlice;

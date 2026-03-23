import { apiSlice } from './apiSlice';

export const careerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCareers: builder.query<any[], void>({
      query: () => '/careers',
      providesTags: ['Career'],
      transformResponse: (response: any) => {
        const data = response.data || response;
        return data.map((career: any) => ({
          ...career,
          requirements: typeof career.requirements === 'string' ? JSON.parse(career.requirements) : (career.requirements || []),
          benefits: typeof career.benefits === 'string' ? JSON.parse(career.benefits) : (career.benefits || []),
        }));
      },
    }),
    createCareer: builder.mutation<any, any>({
      query: (careerData) => ({
        url: '/careers',
        method: 'POST',
        body: {
          ...careerData,
          requirements: JSON.stringify(careerData.requirements || []),
          benefits: JSON.stringify(careerData.benefits || []),
          posted_date: careerData.postedDate || new Date().toISOString().split('T')[0]
        },
      }),
      invalidatesTags: ['Career'],
    }),
    updateCareer: builder.mutation<any, any>({
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
} = careerApiSlice;

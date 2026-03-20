import { apiSlice } from './apiSlice';

export const moodSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMoods: builder.query<any[], void>({
      query: () => '/moods',
      providesTags: ['Mood'],
    }),
    submitMood: builder.mutation<any, any>({
      query: (data) => ({
        url: '/moods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Mood'],
    }),
    getMoodStats: builder.query<any[], void>({
      query: () => '/moods/stats',
      providesTags: ['Mood'],
    }),
  }),
});

export const {
  useGetMoodsQuery,
  useSubmitMoodMutation,
  useGetMoodStatsQuery,
} = moodSlice;

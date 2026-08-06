import type { MoodEntry } from '@/types/models';
import { apiSlice } from './apiSlice';

export const moodSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMoods: builder.query<MoodEntry[], void>({
      query: () => '/moods',
      providesTags: ['Mood'],
      transformResponse: (response: { data: MoodEntry[] }) => response.data,
    }),
    submitMood: builder.mutation<MoodEntry, Partial<MoodEntry>>({
      query: (data) => ({
        url: '/moods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Mood'],
    }),
    getMoodStats: builder.query<{ average: number; count: number }[], void>({
      query: () => '/moods/stats',
      providesTags: ['Mood'],
      transformResponse: (response: { data: { average: number; count: number }[] }) =>
        response.data,
    }),
  }),
});

export const { useGetMoodsQuery, useSubmitMoodMutation, useGetMoodStatsQuery } = moodSlice;

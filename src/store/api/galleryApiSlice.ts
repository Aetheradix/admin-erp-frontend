import type { GalleryItem } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapGalleryItem } from './mappers';

export type { GalleryItem };

export const galleryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query<GalleryItem[], void>({
      query: () => '/gallery',
      providesTags: ['Gallery'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapGalleryItem(item as Record<string, unknown>)) : [];
      },
    }),
    createGalleryItem: builder.mutation<GalleryItem, Partial<GalleryItem>>({
      query: (itemData) => ({
        url: '/gallery',
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: ['Gallery'],
    }),
    deleteGalleryItem: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/gallery/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Gallery'],
    }),
  }),
});

export const {
  useGetGalleryQuery,
  useCreateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = galleryApiSlice;

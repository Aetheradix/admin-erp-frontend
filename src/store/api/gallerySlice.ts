import type { GalleryItem } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapGalleryItem } from './mappers';

export const gallerySlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query<GalleryItem[], void>({
      query: () => '/gallery',
      providesTags: ['Gallery'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapGalleryItem(item as Record<string, unknown>)) : [];
      },
    }),
    uploadGalleryItem: builder.mutation<GalleryItem, Partial<GalleryItem>>({
      query: (item) => ({
        url: '/gallery',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Gallery'],
    }),
    deleteGalleryItem: builder.mutation<{ success: boolean }, string | number>({
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
  useUploadGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = gallerySlice;

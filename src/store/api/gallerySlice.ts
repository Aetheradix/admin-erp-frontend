import { apiSlice } from './apiSlice';

export const gallerySlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query<any[], void>({
      query: () => '/gallery',
      providesTags: ['Gallery'],
    }),
    uploadGalleryItem: builder.mutation<any, any>({
      query: (item) => ({
        url: '/gallery',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Gallery'],
    }),
    deleteGalleryItem: builder.mutation<any, string>({
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

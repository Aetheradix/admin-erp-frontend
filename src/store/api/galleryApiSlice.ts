import { apiSlice } from './apiSlice';

export const galleryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query<any[], void>({
      query: () => '/gallery',
      providesTags: ['Gallery'],
      transformResponse: (response: any) => response.data || response,
    }),
    createGalleryItem: builder.mutation<any, any>({
      query: (itemData) => ({
        url: '/gallery',
        method: 'POST',
        body: itemData,
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
  useCreateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = galleryApiSlice;

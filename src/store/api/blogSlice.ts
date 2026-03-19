import { apiSlice } from './apiSlice';

export const blogSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<any[], void>({
      query: () => '/blogs',
      providesTags: ['Blog'],
    }),
    createBlog: builder.mutation<any, any>({
      query: (blog) => ({
        url: '/blogs',
        method: 'POST',
        body: blog,
      }),
      invalidatesTags: ['Blog'],
    }),
    updateBlog: builder.mutation<any, any>({
      query: (blog) => ({
        url: `/blogs/${blog.id || blog.key}`,
        method: 'PUT',
        body: blog,
      }),
      invalidatesTags: ['Blog'],
    }),
    deleteBlog: builder.mutation<any, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogSlice;

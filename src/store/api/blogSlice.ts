import { apiSlice } from './apiSlice';

export const blogSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<any[], void>({
      query: () => '/blogs',
      providesTags: ['Blog'],
    }),
    getBlog: builder.query<any, string>({
      query: (id) => `/blogs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Blog', id }],
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
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogSlice;

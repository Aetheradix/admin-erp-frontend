import type { Blog } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapBlog } from './mappers';

export type { Blog };

export const blogSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<Blog[], void>({
      query: () => '/blogs',
      providesTags: ['Blog'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapBlog(item as Record<string, unknown>)) : [];
      },
    }),
    getBlog: builder.query<Blog, string>({
      query: (id) => `/blogs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Blog', id }],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: Record<string, unknown> })?.data ?? response;
        return mapBlog(data as Record<string, unknown>);
      },
    }),
    createBlog: builder.mutation<Blog, Partial<Blog>>({
      query: (blog) => ({
        url: '/blogs',
        method: 'POST',
        body: blog,
      }),
      invalidatesTags: ['Blog'],
    }),
    updateBlog: builder.mutation<Blog, Partial<Blog> & { id?: string | number; key?: string }>({
      query: (blog) => ({
        url: `/blogs/${blog.id || blog.key}`,
        method: 'PUT',
        body: blog,
      }),
      invalidatesTags: ['Blog'],
    }),
    deleteBlog: builder.mutation<{ success?: boolean }, string>({
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

import { apiSlice } from './apiSlice';

export type StickyNoteColor = 'amber' | 'blue' | 'emerald' | 'rose' | 'violet' | 'slate';

export interface StickyChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface StickyNote {
  id: number;
  user_id: number;
  project_id?: number | null;
  project_name?: string | null;
  project_key?: string | null;
  title: string;
  content: string;
  checklist: StickyChecklistItem[];
  color: StickyNoteColor;
  is_pinned: boolean;
  is_archived: boolean;
  is_open: boolean;
  is_minimized: boolean;
  is_maximized: boolean;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  z_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateStickyNotePayload {
  project_id?: number | null;
  title?: string;
  content?: string;
  checklist?: StickyChecklistItem[];
  color?: StickyNoteColor;
  is_pinned?: boolean;
  is_open?: boolean;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
  z_index?: number;
}

export interface UpdateStickyNotePayload {
  id: number;
  project_id?: number | null;
  title?: string;
  content?: string;
  checklist?: StickyChecklistItem[];
  color?: StickyNoteColor;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_open?: boolean;
  is_minimized?: boolean;
  is_maximized?: boolean;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
  z_index?: number;
}

export const stickyNotesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStickyNotes: builder.query<
      StickyNote[],
      { archived?: boolean; search?: string; projectId?: number | 'personal' } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.archived) searchParams.set('archived', 'true');
        if (params?.search?.trim()) searchParams.set('search', params.search.trim());
        if (params?.projectId) searchParams.set('project_id', String(params.projectId));
        const qs = searchParams.toString();
        return `/sticky-notes${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (res: { data?: StickyNote[] } | StickyNote[]) =>
        Array.isArray(res) ? res : (res?.data ?? []),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'StickyNotes' as const, id })),
              { type: 'StickyNotes', id: 'LIST' },
            ]
          : [{ type: 'StickyNotes', id: 'LIST' }],
    }),

    createStickyNote: builder.mutation<StickyNote, CreateStickyNotePayload | void>({
      query: (body) => ({
        url: '/sticky-notes',
        method: 'POST',
        body: body ?? {},
      }),
      transformResponse: (res: { data?: StickyNote } | StickyNote) =>
        'data' in res && res.data ? res.data : (res as StickyNote),
      invalidatesTags: [{ type: 'StickyNotes', id: 'LIST' }],
    }),

    updateStickyNote: builder.mutation<StickyNote, UpdateStickyNotePayload>({
      query: ({ id, ...body }) => ({
        url: `/sticky-notes/${id}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          stickyNotesApiSlice.util.updateQueryData('getStickyNotes', undefined, (draft) => {
            const note = draft.find((n) => n.id === id);
            if (note) Object.assign(note, patch);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      transformResponse: (res: { data?: StickyNote } | StickyNote) =>
        'data' in res && res.data ? res.data : (res as StickyNote),
      invalidatesTags: (_res, _err, { id, is_archived, is_pinned, project_id }) =>
        is_archived !== undefined || is_pinned !== undefined || project_id !== undefined
          ? [{ type: 'StickyNotes', id: 'LIST' }, { type: 'StickyNotes', id }]
          : [{ type: 'StickyNotes', id }],
    }),

    deleteStickyNote: builder.mutation<void, number>({
      query: (id) => ({
        url: `/sticky-notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'StickyNotes', id: 'LIST' },
        { type: 'StickyNotes', id },
      ],
    }),
  }),
});

export const {
  useGetStickyNotesQuery,
  useCreateStickyNoteMutation,
  useUpdateStickyNoteMutation,
  useDeleteStickyNoteMutation,
} = stickyNotesApiSlice;

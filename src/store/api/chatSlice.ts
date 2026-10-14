import { apiSlice } from './apiSlice';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ChannelType = 'public' | 'private' | 'direct' | 'project';

export interface ChannelMember {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
  designation?: string;
}

export interface Channel {
  id: number;
  name: string;
  description?: string;
  type: ChannelType;
  icon?: string;
  color?: string;
  members: ChannelMember[];
  memberCount: number;
  lastMessage?: ChatMessage;
  lastActivity?: string;
  unreadCount?: number;
  createdBy?: number;
  createdAt: string;
  isPinned?: boolean;
  projectId?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: number[];
}

export interface MessageAttachment {
  id: number;
  name: string;
  url: string;
  size: number;
  type: string;
  mimeType: string;
}

export interface ChatMessage {
  id: number;
  channelId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  senderDesignation?: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replyTo?: number;
  replyToMessage?: ChatMessage;
  isEdited?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateChannelPayload {
  name: string;
  description?: string;
  type: ChannelType;
  memberIds: number[];
  icon?: string;
  color?: string;
  projectId?: number;
}

export interface SendMessagePayload {
  channelId: number;
  content: string;
  replyTo?: number;
}

// ─── Slice ─────────────────────────────────────────────────────────────────────

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Channels
    getChannels: builder.query<Channel[], void>({
      query: () => '/channels/',
      providesTags: ['Channels'],
    }),
    getChannel: builder.query<Channel, number>({
      query: (id) => `/channels/${id}/`,
      providesTags: (_r, _e, id) => [{ type: 'Channels', id }],
    }),
    createChannel: builder.mutation<Channel, CreateChannelPayload>({
      query: (body) => ({ url: '/channels/', method: 'POST', body }),
      invalidatesTags: ['Channels'],
    }),
    updateChannel: builder.mutation<Channel, { id: number; data: Partial<CreateChannelPayload> }>({
      query: ({ id, data }) => ({ url: `/channels/${id}/`, method: 'PATCH', body: data }),
      invalidatesTags: ['Channels'],
    }),
    deleteChannel: builder.mutation<void, number>({
      query: (id) => ({ url: `/channels/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Channels'],
    }),
    addChannelMember: builder.mutation<void, { channelId: number; userId: number }>({
      query: ({ channelId, userId }) => ({
        url: `/channels/${channelId}/members/`,
        method: 'POST',
        body: { user_id: userId },
      }),
      invalidatesTags: ['Channels'],
    }),
    removeChannelMember: builder.mutation<void, { channelId: number; userId: number }>({
      query: ({ channelId, userId }) => ({
        url: `/channels/${channelId}/members/${userId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Channels'],
    }),

    // Messages
    getMessages: builder.query<ChatMessage[], { channelId: number; page?: number }>({
      query: ({ channelId, page = 1 }) => `/channels/${channelId}/messages/?page=${page}`,
      providesTags: (_r, _e, { channelId }) => [{ type: 'ChatMessages', id: channelId }],
    }),
    sendMessage: builder.mutation<ChatMessage, SendMessagePayload>({
      query: ({ channelId, content, replyTo }) => ({
        url: `/channels/${channelId}/messages/`,
        method: 'POST',
        body: { content, reply_to: replyTo },
      }),
      invalidatesTags: (_r, _e, { channelId }) => [
        { type: 'ChatMessages', id: channelId },
        'Channels',
      ],
    }),
    editMessage: builder.mutation<ChatMessage, { id: number; channelId: number; content: string }>({
      query: ({ id, channelId, content }) => ({
        url: `/channels/${channelId}/messages/${id}/`,
        method: 'PATCH',
        body: { content },
      }),
      invalidatesTags: (_r, _e, { channelId }) => [{ type: 'ChatMessages', id: channelId }],
    }),
    deleteMessage: builder.mutation<void, { id: number; channelId: number }>({
      query: ({ id, channelId }) => ({
        url: `/channels/${channelId}/messages/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { channelId }) => [{ type: 'ChatMessages', id: channelId }],
    }),
    reactToMessage: builder.mutation<void, { messageId: number; channelId: number; emoji: string }>(
      {
        query: ({ messageId, channelId, emoji }) => ({
          url: `/channels/${channelId}/messages/${messageId}/react/`,
          method: 'POST',
          body: { emoji },
        }),
        invalidatesTags: (_r, _e, { channelId }) => [{ type: 'ChatMessages', id: channelId }],
      }
    ),
    pinMessage: builder.mutation<void, { messageId: number; channelId: number }>({
      query: ({ messageId, channelId }) => ({
        url: `/channels/${channelId}/messages/${messageId}/pin/`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { channelId }) => [{ type: 'ChatMessages', id: channelId }],
    }),
    markChannelRead: builder.mutation<void, number>({
      query: (channelId) => ({
        url: `/channels/${channelId}/mark-read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Channels'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChannelsQuery,
  useGetChannelQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useAddChannelMemberMutation,
  useRemoveChannelMemberMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useReactToMessageMutation,
  usePinMessageMutation,
  useMarkChannelReadMutation,
} = chatApiSlice;

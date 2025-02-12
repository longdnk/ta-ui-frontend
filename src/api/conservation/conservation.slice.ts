import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiResponse, NewChatPayload, NewChatResponse } from '../../types';

export const conversationApi = createApi({
    reducerPath: 'chatApi',
    baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_API_URL }),
    tagTypes: ['Chat'],
    endpoints: (builder) => ({
        getAllChat: builder.query<ApiResponse<NewChatResponse[]>, void>({
            query: () => '/chats',
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Chat' as const, id })),
                        { type: 'Chat', id: 'LIST' },
                    ]
                    : [{ type: 'Chat', id: 'LIST' }],
        }),
        getChatById: builder.query<ApiResponse<NewChatResponse>, number | string>({
            query: chatId => `/chats/${chatId}`,
            providesTags: (result, error, chatId) => [{ type: 'Chat', id: chatId }],
        }),
        addNewChat: builder.mutation<ApiResponse<NewChatResponse>, NewChatPayload>({
            query: (payload) => ({
                url: '/chats',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: [{ type: 'Chat', id: 'LIST' }],
        }),
        updateChat: builder.mutation<ApiResponse<NewChatResponse>, Partial<NewChatPayload> & { id: number }>({
            query: (payload) => ({
                url: `/chats/${payload.id}`,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Chat', id: arg.id }],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(conversationApi.endpoints.getChatById.initiate(String(arg.id)));
                } catch (err) {
                    console.error('Failed to prefetch updated chat detail', err);
                }
            },
        }),
        deleteChat: builder.mutation<ApiResponse<NewChatResponse>, number>({
            query: (id) => ({
                url: `/chats/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Chat', id }],
        }),
    }),
});

export const {
    useGetAllChatQuery,
    useLazyGetAllChatQuery,
    useLazyGetChatByIdQuery,
    useGetChatByIdQuery,
    useAddNewChatMutation,
    useUpdateChatMutation,
    useDeleteChatMutation,
} = conversationApi;

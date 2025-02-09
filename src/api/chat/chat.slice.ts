import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Payload } from "../../types";

const baseUrl = process.env.REACT_APP_API_KEY

export const chatApi = createApi({
    reducerPath: 'chat',
    baseQuery: fetchBaseQuery({ baseUrl: baseUrl, method: 'POST', timeout: 10000 }),
    endpoints: (builder) => ({
        chatStream: builder.mutation<string, Payload>({
            queryFn: async (body, _queryApi, _extraOptions) => {
                try {
                    body.conservation.pop();
                    const response = await fetch(`${baseUrl}/chats/completion`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });
                    let result: string[] = []

                    if (!response.body) {
                        throw new Error('Streaming not supported');
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder('utf-8');
                    let done = false;
                    body.callbackReset(true)

                    while (!done) {
                        const { value, done: readerDone } = await reader.read();
                        done = readerDone;

                        if (value) {
                            const chunk = decoder.decode(value);
                            result.push(chunk)
                            body.callbackResult(chunk)
                        }
                    }
                    body.callbackReset(false)
                    return { data: result.toString() }
                } catch (error: any) {
                    console.log(error)
                }
            },
        }),
    }),
});

export const { useChatStreamMutation } = chatApi;
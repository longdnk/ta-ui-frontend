import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { authApi } from "../api/auth/auth.slice";
import { ragApi } from "../api/rag/rag.slice";
import { chatApi } from "../api/chat/chat.slice";
import { conversationApi} from "../api/conservation/conservation.slice";

const middlewares = [
    authApi.middleware,
    ragApi.middleware,
    chatApi.middleware,
    conversationApi.middleware
];

export const store = configureStore({
    reducer: {
        // Auth api
        [authApi.reducerPath]: authApi.reducer,
        [ragApi.reducerPath]: ragApi.reducer,
        [chatApi.reducerPath]: chatApi.reducer,
        [conversationApi.reducerPath]: conversationApi.reducer
    },
    // Add middleware item
    middleware(getDefaultMiddleware) {
        return getDefaultMiddleware().concat(middlewares);
    }
});

// re-fetch on Reconnect or re-fetch on focus
// setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;

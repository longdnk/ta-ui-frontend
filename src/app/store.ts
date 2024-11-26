import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { authApi } from "../api/auth/auth.slice";

const middlewares = [authApi.middleware];

export const store = configureStore({
    reducer: {
        // Auth api
        [authApi.reducerPath]: authApi.reducer,
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

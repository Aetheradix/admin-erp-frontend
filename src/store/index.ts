import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import appReducer from './slices/appSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    app: appReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

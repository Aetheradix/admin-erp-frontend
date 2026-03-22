import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  theme: 'light' | 'dark';
  sidebarExpanded: boolean;
}

const initialState: AppState = {
  theme: 'light',
  sidebarExpanded: true,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setSidebarExpanded: (state, action: PayloadAction<boolean>) => {
      state.sidebarExpanded = action.payload;
    },
  },
});

export const { toggleTheme, setSidebarExpanded } = appSlice.actions;

export default appSlice.reducer;

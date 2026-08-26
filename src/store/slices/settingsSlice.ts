import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';

// ── API Token type ──
export interface ApiToken {
  id: string;
  name: string;
  keyPreview: string; // last 8 chars only
  createdAt: string; // ISO string
}

// ── Settings state ──
export interface SettingsState {
  language: string;
  density: 'compact' | 'spacious';
  twoFactorEnabled: boolean;
  sessionTimeoutEnabled: boolean;
  pushNotifications: boolean;
  marketingDigest: boolean;
  darkMode: boolean;
  accentColor: string;
  autoArchive: boolean;
  apiTokens: ApiToken[];
  geminiApiKey: string;
}

const STORAGE_KEY = 'aether_settings';

const DEFAULT_STATE: SettingsState = {
  language: 'English (US)',
  density: 'compact',
  twoFactorEnabled: true,
  sessionTimeoutEnabled: true,
  pushNotifications: true,
  marketingDigest: false,
  darkMode: false,
  accentColor: '#E8583A',
  autoArchive: true,
  apiTokens: [],
  geminiApiKey: '',
};

function loadFromStorage(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.language === 'English') {
        parsed.language = 'English (US)';
      }
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {
    // corrupted – fall through to defaults
  }
  return { ...DEFAULT_STATE };
}

function saveToStorage(state: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable – swallow
  }
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadFromStorage(),
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
      saveToStorage(state);
    },
    setDensity(state, action: PayloadAction<'compact' | 'spacious'>) {
      state.density = action.payload;
      saveToStorage(state);
    },
    setTwoFactor(state, action: PayloadAction<boolean>) {
      state.twoFactorEnabled = action.payload;
      saveToStorage(state);
    },
    setSessionTimeout(state, action: PayloadAction<boolean>) {
      state.sessionTimeoutEnabled = action.payload;
      saveToStorage(state);
    },
    setPushNotifications(state, action: PayloadAction<boolean>) {
      state.pushNotifications = action.payload;
      saveToStorage(state);
    },
    setMarketingDigest(state, action: PayloadAction<boolean>) {
      state.marketingDigest = action.payload;
      saveToStorage(state);
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
      saveToStorage(state);
    },
    setAccentColor(state, action: PayloadAction<string>) {
      state.accentColor = action.payload;
      saveToStorage(state);
    },
    setAutoArchive(state, action: PayloadAction<boolean>) {
      state.autoArchive = action.payload;
      saveToStorage(state);
    },
    setGeminiApiKey(state, action: PayloadAction<string>) {
      state.geminiApiKey = action.payload;
      saveToStorage(state);
    },
    addApiToken(state, action: PayloadAction<ApiToken>) {
      state.apiTokens.push(action.payload);
      saveToStorage(state);
    },
    removeApiToken(state, action: PayloadAction<string>) {
      state.apiTokens = state.apiTokens.filter((t) => t.id !== action.payload);
      saveToStorage(state);
    },
    resetAllSettings() {
      const reset = { ...DEFAULT_STATE };
      saveToStorage(reset);
      return reset;
    },
  },
});

export const {
  setLanguage,
  setDensity,
  setTwoFactor,
  setSessionTimeout,
  setPushNotifications,
  setMarketingDigest,
  setDarkMode,
  setAccentColor,
  setAutoArchive,
  setGeminiApiKey,
  addApiToken,
  removeApiToken,
  resetAllSettings,
} = settingsSlice.actions;

// ── Selectors ──
export const selectSettings = (state: RootState) => state.settings;
export const selectDarkMode = (state: RootState) => state.settings.darkMode;
export const selectAccentColor = (state: RootState) => state.settings.accentColor;
export const selectDensity = (state: RootState) => state.settings.density;
export const selectGeminiApiKey = (state: RootState) => state.settings.geminiApiKey;

export default settingsSlice.reducer;

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectSettings,
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
  resetAllSettings,
} from '@/store/slices/settingsSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

export const LANGUAGES = [
  { label: 'English (US)', value: 'English (US)' },
  { label: 'English (UK)', value: 'English (UK)' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Hindi', value: 'Hindi' },
];

export const THEME_COLORS = [
  { color: '#E8583A', name: 'Aether Coral' },
  { color: '#3B82F6', name: 'Ocean Blue' },
  { color: '#10B981', name: 'Emerald Green' },
  { color: '#F59E0B', name: 'Amber Gold' },
];

export const useSettings = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);

  const updateLanguage = (language: string) => {
    dispatch(setLanguage(language));
    showToast({
      severity: 'success',
      summary: 'Language Updated',
      detail: `System language set to ${language}.`,
    });
  };

  const updateDensity = (density: 'compact' | 'spacious') => {
    dispatch(setDensity(density));
    showToast({
      severity: 'info',
      summary: 'Display Density',
      detail: `Layout spacing updated to ${density}.`,
    });
  };

  const updateTwoFactor = (enabled: boolean) => {
    dispatch(setTwoFactor(enabled));
    showToast({
      severity: enabled ? 'success' : 'warn',
      summary: '2FA Security',
      detail: enabled
        ? 'Two-Factor Authentication enabled.'
        : 'Two-Factor Authentication disabled.',
    });
  };

  const updateSessionTimeout = (enabled: boolean) => {
    dispatch(setSessionTimeout(enabled));
    showToast({
      severity: 'info',
      summary: 'Session Timeout',
      detail: enabled ? 'Inactivity sign-out (30 min) enabled.' : 'Session timeout disabled.',
    });
  };

  const updatePushNotifications = async (enabled: boolean) => {
    dispatch(setPushNotifications(enabled));
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('AetherERP Push Notifications', {
              body: 'Real-time project alerts and system notifications are now active.',
            });
          }
        } else {
          new Notification('AetherERP Push Notifications', {
            body: 'Real-time project alerts and system notifications are now active.',
          });
        }
      } catch {
        // Notification permission denied or not supported in frame
      }
    }
    showToast({
      severity: 'info',
      summary: 'Push Notifications',
      detail: enabled ? 'Push notifications enabled.' : 'Push notifications disabled.',
    });
  };

  const updateMarketingDigest = (enabled: boolean) => {
    dispatch(setMarketingDigest(enabled));
    showToast({
      severity: 'info',
      summary: 'Marketing & Digest',
      detail: enabled ? 'Weekly digest subscribed.' : 'Weekly digest unsubscribed.',
    });
  };

  const updateDarkMode = (enabled: boolean) => {
    dispatch(setDarkMode(enabled));
    showToast({
      severity: 'info',
      summary: 'Appearance Mode',
      detail: enabled ? 'Dark mode enabled.' : 'Light mode enabled.',
    });
  };

  const updateAccentColor = (color: string) => {
    dispatch(setAccentColor(color));
    const matched = THEME_COLORS.find((c) => c.color === color);
    showToast({
      severity: 'success',
      summary: 'Theme Accent',
      detail: `Accent color updated to ${matched?.name || color}.`,
    });
  };

  const updateAutoArchive = (enabled: boolean) => {
    dispatch(setAutoArchive(enabled));
    showToast({
      severity: 'info',
      summary: 'Auto-Archive',
      detail: enabled ? 'Auto-archiving closed records enabled.' : 'Auto-archiving disabled.',
    });
  };

  const updateGeminiApiKey = (key: string) => {
    dispatch(setGeminiApiKey(key.trim()));
    showToast({
      severity: 'success',
      summary: 'Gemini API Key',
      detail: 'Google Gemini API Key has been updated.',
    });
  };

  const handleResetSettings = () => {
    dispatch(resetAllSettings());
  };

  return {
    settings,
    updateLanguage,
    updateDensity,
    updateTwoFactor,
    updateSessionTimeout,
    updatePushNotifications,
    updateMarketingDigest,
    updateDarkMode,
    updateAccentColor,
    updateAutoArchive,
    updateGeminiApiKey,
    handleResetSettings,
    LANGUAGES,
    THEME_COLORS,
  };
};

import { useState } from 'react';

const LANGUAGES = [
  { label: 'English (US)', value: 'English' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'German', value: 'German' },
  { label: 'French', value: 'French' },
];

const THEME_COLORS = ['#F05D5E', '#3B82F6', '#10B981', '#F59E0B'];

export const useSettings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    marketingEmails: false,
    twoFactor: true,
    darkMode: false,
    language: 'English',
    autoArchive: true,
  });

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    updateSetting,
    LANGUAGES,
    THEME_COLORS,
  };
};

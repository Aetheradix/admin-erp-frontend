import { useEffect, useState } from 'react';
import { initialAppConfig, notificationPreferences as mockPrefs } from '../mockData';
import { AppConfig, NotificationPreference } from '../types';

export const useGeneralSettings = () => {
  const [config] = useState<AppConfig>(initialAppConfig);
  const [notifications, setNotifications] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        setNotifications(mockPrefs);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return {
    config,
    notifications,
    loading,
  };
};

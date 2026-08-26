import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog.utils';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { ApiTokenModal } from './components/ApiTokenModal';
import { GeneralSettingsSection } from './components/sections/GeneralSettingsSection';
import { SecuritySettingsSection } from './components/sections/SecuritySettingsSection';
import { NotificationSettingsSection } from './components/sections/NotificationSettingsSection';
import { AppearanceSettingsSection } from './components/sections/AppearanceSettingsSection';
import { AdvancedSettingsSection } from './components/sections/AdvancedSettingsSection';
import { DangerZoneSection } from './components/sections/DangerZoneSection';

export function SettingsPage() {
  const { t } = useTranslation();
  const {
    settings,
    updateLanguage,
    updateDensity,
    updateSessionTimeout,
    updatePushNotifications,
    updateMarketingDigest,
    updateDarkMode,
    updateAccentColor,
    updateAutoArchive,
    updateGeminiApiKey,
    LANGUAGES,
    THEME_COLORS,
  } = useSettings();

  const { logout } = useAuth();
  const navigate = useNavigate();

  const [tokenModalVisible, setTokenModalVisible] = useState(false);

  // Handle Cache Reset & Logout
  const handleCacheReset = () => {
    showConfirm({
      header: 'System Cache Reset & Deep Logout',
      message:
        'This action will erase all locally stored workspace settings, session tokens, cached metadata, and log you out immediately. This action cannot be undone. Do you wish to proceed?',
      accept: async () => {
        showToast({
          severity: 'warn',
          summary: 'Clearing Cache',
          detail: 'System cache cleared. Logging out...',
        });
        localStorage.clear();
        try {
          await logout();
        } catch {
          // Ignore API error on forced logout
        }
        navigate('/auth/login', { replace: true });
      },
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
        <GeneralSettingsSection
          language={settings.language}
          density={settings.density}
          languages={LANGUAGES}
          onLanguageChange={updateLanguage}
          onDensityChange={updateDensity}
        />

        <SecuritySettingsSection
          sessionTimeoutEnabled={settings.sessionTimeoutEnabled}
          onSessionTimeoutChange={updateSessionTimeout}
        />

        <NotificationSettingsSection
          pushNotifications={settings.pushNotifications}
          marketingDigest={settings.marketingDigest}
          onPushNotificationsChange={updatePushNotifications}
          onMarketingDigestChange={updateMarketingDigest}
        />

        <AppearanceSettingsSection
          darkMode={settings.darkMode}
          accentColor={settings.accentColor}
          themeColors={THEME_COLORS}
          onDarkModeChange={updateDarkMode}
          onAccentColorChange={updateAccentColor}
        />

        <AdvancedSettingsSection
          geminiApiKey={settings.geminiApiKey}
          autoArchive={settings.autoArchive}
          onGeminiApiKeySave={updateGeminiApiKey}
          onAutoArchiveChange={updateAutoArchive}
          onOpenTokenModal={() => setTokenModalVisible(true)}
        />

        <DangerZoneSection onCacheReset={handleCacheReset} />
      </div>

      <ApiTokenModal visible={tokenModalVisible} onHide={() => setTokenModalVisible(false)} />
    </div>
  );
}

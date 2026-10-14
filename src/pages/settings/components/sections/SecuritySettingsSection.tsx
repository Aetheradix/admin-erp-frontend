import React, { useState } from 'react';
import { Lock, KeyRound } from 'lucide-react';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { Button } from '@/components/ui/primitives/Button';
import { SettingItem, SettingSection } from '../SettingUI';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

interface SecuritySettingsSectionProps {
  sessionTimeoutEnabled: boolean;
  onSessionTimeoutChange: (enabled: boolean) => void;
}

export const SecuritySettingsSection: React.FC<SecuritySettingsSectionProps> = ({
  sessionTimeoutEnabled,
  onSessionTimeoutChange,
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <SettingSection title="Account Security">
        <SettingItem
          icon={Lock}
          label="Session Timeout"
          description="Automatically sign out after 30 minutes of inactivity."
          control={
            <InputSwitch
              checked={sessionTimeoutEnabled}
              onChange={(e) => onSessionTimeoutChange(e.value)}
            />
          }
        />

        <SettingItem
          icon={KeyRound}
          label="Password & Credentials"
          description="Update your account password and invalidate existing device sessions."
          control={
            <Button
              variant="outline"
              label="Change Password"
              icon="pi pi-key"
              onClick={() => setShowPasswordModal(true)}
              className="rounded-xl! text-xs font-bold"
            />
          }
        />
      </SettingSection>

      <ChangePasswordModal
        visible={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        requireCurrentPassword={true}
      />
    </>
  );
};

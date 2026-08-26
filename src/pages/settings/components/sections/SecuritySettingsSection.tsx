import React from 'react';
import { Lock } from 'lucide-react';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { SettingItem, SettingSection } from '../SettingUI';

interface SecuritySettingsSectionProps {
    sessionTimeoutEnabled: boolean;
    onSessionTimeoutChange: (enabled: boolean) => void;
}

export const SecuritySettingsSection: React.FC<SecuritySettingsSectionProps> = ({
    sessionTimeoutEnabled,
    onSessionTimeoutChange,
}) => {
    return (
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
        </SettingSection>
    );
};

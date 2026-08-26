import React from 'react';
import { Bell, Mail } from 'lucide-react';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { SettingItem, SettingSection } from '../SettingUI';

interface NotificationSettingsSectionProps {
    pushNotifications: boolean;
    marketingDigest: boolean;
    onPushNotificationsChange: (enabled: boolean) => void;
    onMarketingDigestChange: (enabled: boolean) => void;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
    pushNotifications,
    marketingDigest,
    onPushNotificationsChange,
    onMarketingDigestChange,
}) => {
    return (
        <SettingSection title="Notifications">
            <SettingItem
                icon={Bell}
                label="Push Notifications"
                description="Receive real-time alerts for project updates and mentions."
                control={
                    <InputSwitch
                        checked={pushNotifications}
                        onChange={(e) => onPushNotificationsChange(e.value)}
                    />
                }
            />
            <SettingItem
                icon={Mail}
                label="Marketing & Digest"
                description="Weekly summary of company news and platform updates."
                control={
                    <InputSwitch
                        checked={marketingDigest}
                        onChange={(e) => onMarketingDigestChange(e.value)}
                    />
                }
            />
        </SettingSection>
    );
};

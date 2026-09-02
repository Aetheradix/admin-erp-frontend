import React, { useState, useEffect } from 'react';
import { Sparkles, Database, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { SettingItem, SettingSection } from '../SettingUI';

interface AdvancedSettingsSectionProps {
  geminiApiKey: string;
  autoArchive: boolean;
  onGeminiApiKeySave: (key: string) => void;
  onAutoArchiveChange: (enabled: boolean) => void;
  onOpenTokenModal: () => void;
}

export const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({
  geminiApiKey,
  autoArchive,
  onGeminiApiKeySave,
  onAutoArchiveChange,
  onOpenTokenModal,
}) => {
  const [keyInput, setKeyInput] = useState(geminiApiKey || '');

  useEffect(() => {
    setKeyInput(geminiApiKey || '');
  }, [geminiApiKey]);

  return (
    <SettingSection title="Advanced & Data">
      <SettingItem
        icon={Sparkles}
        label="Gemini AI Copilot Key"
        description="Set your Google Gemini API Key to enable the Aether Copilot agent."
        control={
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-48 sm:w-64 h-10 px-3 text-xs rounded-md bg-surface-subtle border border-border-strong text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
            />
            <Button
              variant="primary"
              onClick={() => onGeminiApiKeySave(keyInput)}
              className="h-10 px-4 rounded-md! font-bold text-xs bg-primary! text-white! cursor-pointer"
            >
              Save
            </Button>
          </div>
        }
      />
      <SettingItem
        icon={Database}
        label="Auto-Archive Records"
        description="Periodically move closed projects to the historical database."
        control={
          <InputSwitch checked={autoArchive} onChange={(e) => onAutoArchiveChange(e.value)} />
        }
      />
      <SettingItem
        icon={Share2}
        label="Integration API Access"
        description="Manage tokens for external system connections and bots."
        control={
          <Button
            variant="secondary"
            onClick={onOpenTokenModal}
            className="h-10 px-4 rounded-md! font-bold text-xs uppercase underline tracking-wider cursor-pointer hover:bg-primary-soft hover:text-primary transition-colors"
          >
            Manage Tokens
          </Button>
        }
      />
    </SettingSection>
  );
};

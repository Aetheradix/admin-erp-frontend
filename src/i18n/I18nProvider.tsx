import React, { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectSettings } from '@/store/slices/settingsSlice';
import i18n, { LANGUAGE_MAP } from './i18n';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const settings = useAppSelector(selectSettings);

    useEffect(() => {
        const targetLang = LANGUAGE_MAP[settings.language] || 'en';
        if (i18n.language !== targetLang) {
            i18n.changeLanguage(targetLang);
        }
    }, [settings.language]);

    return <>{children}</>;
};

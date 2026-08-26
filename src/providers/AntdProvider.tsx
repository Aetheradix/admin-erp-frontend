import { type ReactNode, useMemo } from 'react';
import { ConfigProvider, App } from 'antd';
import { buildAntdTheme } from '@/theme/antdTheme';
import { useAppSelector } from '@/store/hooks';
import { selectAccentColor, selectDarkMode } from '@/store/slices/settingsSlice';

export const AntdProvider = ({ children }: { children: ReactNode }) => {
  const darkMode = useAppSelector(selectDarkMode);
  const accentColor = useAppSelector(selectAccentColor);

  const dynamicTheme = useMemo(
    () => buildAntdTheme(accentColor, darkMode),
    [accentColor, darkMode]
  );

  return (
    <ConfigProvider theme={dynamicTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
};

import { type ReactNode } from 'react';
import { ConfigProvider, App } from 'antd';
import { antdTheme } from '@/theme/antdTheme';

export const AntdProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
};

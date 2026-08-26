import { type ReactNode } from 'react';
import { AntdProvider } from './AntdProvider';
import { AuthProvider } from '../context/AuthContext';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { I18nProvider } from '@/i18n/I18nProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <I18nProvider>
        <AntdProvider>
          <AuthProvider>{children}</AuthProvider>
        </AntdProvider>
      </I18nProvider>
    </Provider>
  );
};

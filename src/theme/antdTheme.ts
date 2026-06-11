import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#E8583A',
    colorPrimaryHover: '#d04a2e',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#e11d48',
    colorInfo: '#E8583A',
    colorLink: '#E8583A',
    colorLinkHover: '#d04a2e',
    borderRadius: 6,
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f4f2',
    colorText: '#1a1a1a',
    colorTextSecondary: '#6b635e',
    colorBorder: 'rgba(0, 0, 0, 0.06)',
    controlHeight: 40,
  },
  components: {
    Button: {
      borderRadius: 6,
      fontWeight: 500,
      controlHeight: 38,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 48,
      paddingBlock: 12,
      paddingInline: 16,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 48,
    },
    Table: {
      borderRadius: 8,
      headerBg: 'transparent',
      rowHoverBg: 'rgba(250, 249, 248, 0.8)',
    },
    Modal: {
      borderRadiusLG: 12,
      paddingContentHorizontalLG: 32,
    },
    Switch: {
      colorPrimary: '#E8583A',
    },
    Tag: {
      borderRadiusSM: 4,
    },
    DatePicker: {
      borderRadius: 6,
      controlHeight: 48,
    },
    Pagination: {
      borderRadius: 6,
      itemActiveBg: '#E8583A',
    },
  },
};

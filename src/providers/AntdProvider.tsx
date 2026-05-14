'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';

const brandColors = {
  primary: '#E8583A',
  primaryHover: '#d04a2e',
  primaryBg: '#fef0ed',
  primaryBorder: '#f9c4b8',
  success: '#059669',
  warning: '#d97706',
  error: '#e11d48',
  info: '#0284c7',
  textPrimary: '#0d0d0d',
  textSecondary: '#6b635e',
  textTertiary: '#9c958f',
  bgBase: '#f5f4f2',
  bgElevated: '#ffffff',
  bgSubtle: '#faf9f8',
  borderBase: 'rgba(0,0,0,0.06)',
  borderStrong: 'rgba(0,0,0,0.1)',
};

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            // Brand
            colorPrimary: brandColors.primary,
            colorSuccess: brandColors.success,
            colorWarning: brandColors.warning,
            colorError: brandColors.error,
            colorInfo: brandColors.info,

            // Typography
            fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 14,
            fontSizeHeading1: 32,
            fontSizeHeading2: 26,
            fontSizeHeading3: 22,
            fontSizeHeading4: 18,
            fontSizeHeading5: 16,

            // Shape
            borderRadius: 10,
            borderRadiusLG: 14,
            borderRadiusSM: 8,

            // Colors
            colorBgBase: brandColors.bgBase,
            colorBgContainer: brandColors.bgElevated,
            colorBgElevated: brandColors.bgElevated,
            colorBgLayout: brandColors.bgBase,
            colorText: brandColors.textPrimary,
            colorTextSecondary: brandColors.textSecondary,
            colorTextTertiary: brandColors.textTertiary,
            colorBorder: brandColors.borderBase,
            colorBorderSecondary: brandColors.borderBase,

            // Shadows
            boxShadow: '0 4px 20px rgba(232,88,58,0.04)',
            boxShadowSecondary: '0 6px 16px rgba(0,0,0,0.06)',

            // Sizing
            controlHeight: 42,
            controlHeightLG: 48,
            controlHeightSM: 34,
          },
          components: {
            Button: {
              fontWeight: 600,
              paddingInline: 24,
              primaryShadow: '0 4px 14px rgba(232,88,58,0.3)',
              defaultBorderColor: brandColors.borderStrong,
            },
            Card: {
              borderRadiusLG: 16,
              paddingLG: 24,
              boxShadowTertiary: '0 1px 4px rgba(0,0,0,0.04)',
            },
            Input: {
              activeBorderColor: brandColors.primary,
              hoverBorderColor: brandColors.primaryBorder,
              paddingInline: 16,
            },
            Table: {
              headerBg: 'transparent',
              headerColor: brandColors.textSecondary,
              headerSplitColor: 'transparent',
              rowHoverBg: brandColors.bgSubtle,
              borderColor: brandColors.borderBase,
              cellPaddingBlock: 14,
              cellPaddingInline: 16,
              headerBorderRadius: 12,
            },
            Menu: {
              itemBorderRadius: 10,
              itemHeight: 44,
              itemMarginBlock: 4,
              itemMarginInline: 8,
              itemPaddingInline: 16,
              subMenuItemBg: 'transparent',
              itemSelectedBg: brandColors.primaryBg,
              itemSelectedColor: brandColors.primary,
              itemHoverBg: brandColors.bgSubtle,
              itemActiveBg: brandColors.primaryBg,
              iconSize: 18,
              collapsedIconSize: 20,
            },
            Layout: {
              siderBg: brandColors.bgElevated,
              headerBg: brandColors.bgElevated,
              bodyBg: brandColors.bgBase,
              triggerBg: brandColors.bgSubtle,
            },
            Tabs: {
              inkBarColor: brandColors.primary,
              itemActiveColor: brandColors.primary,
              itemSelectedColor: brandColors.primary,
              itemHoverColor: brandColors.primaryHover,
              titleFontSize: 15,
            },
            Tag: {
              borderRadiusSM: 6,
              fontSizeSM: 12,
            },
            Badge: {
              dotSize: 8,
            },
            Breadcrumb: {
              separatorMargin: 10,
              fontSize: 13,
            },
            Statistic: {
              titleFontSize: 13,
              contentFontSize: 28,
            },
            Timeline: {
              dotBorderWidth: 3,
            },
            Modal: {
              borderRadiusLG: 16,
              paddingContentHorizontalLG: 28,
            },
            Drawer: {
              paddingLG: 24,
            },
            Select: {
              optionSelectedBg: brandColors.primaryBg,
              optionActiveBg: brandColors.bgSubtle,
            },
            DatePicker: {
              activeBorderColor: brandColors.primary,
              hoverBorderColor: brandColors.primaryBorder,
            },
            Progress: {
              defaultColor: brandColors.primary,
              remainingColor: 'rgba(232,88,58,0.08)',
            },
            Avatar: {
              containerSize: 40,
              containerSizeLG: 48,
              containerSizeSM: 32,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}

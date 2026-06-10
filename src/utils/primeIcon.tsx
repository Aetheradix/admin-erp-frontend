import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloudUploadOutlined,
  CreditCardOutlined,
  EllipsisOutlined,
  HistoryOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  SlidersOutlined,
  SoundOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

const ICON_MAP: Record<string, ReactNode> = {
  'pi pi-plus': <PlusOutlined />,
  'pi pi-user-plus': <UserAddOutlined />,
  'pi pi-arrow-left': <ArrowLeftOutlined />,
  'pi pi-history': <HistoryOutlined />,
  'pi pi-sliders-h': <SlidersOutlined />,
  'pi pi-inbox': <InboxOutlined />,
  'pi pi-search': <SearchOutlined />,
  'pi pi-ellipsis-h': <EllipsisOutlined />,
  'pi pi-spinner': <LoadingOutlined spin />,
  'pi pi-info-circle': <InfoCircleOutlined />,
  'pi pi-user-edit': <UserOutlined />,
  'pi pi-send': <SendOutlined />,
  'pi pi-check': <CheckOutlined />,
  'pi pi-key': <KeyOutlined />,
  'pi pi-megaphone': <SoundOutlined />,
  'pi pi-cloud-upload': <CloudUploadOutlined />,
  'pi pi-credit-card': <CreditCardOutlined />,
  'pi pi-calendar-plus': <CalendarOutlined />,
};

export function resolvePrimeIcon(icon?: string): ReactNode | undefined {
  if (!icon) return undefined;
  return ICON_MAP[icon] ?? undefined;
}

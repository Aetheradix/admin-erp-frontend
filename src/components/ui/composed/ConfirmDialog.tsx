import { Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

export const ConfirmDialog = () => null;

export const showConfirm = ({
  message,
  header = 'Confirm Action',
  icon: _icon,
  accept,
  reject,
}: {
  message: string;
  header?: string;
  icon?: string;
  accept: () => void;
  reject?: () => void;
}) => {
  Modal.confirm({
    title: header,
    icon: <InfoCircleOutlined className="text-primary text-3xl" />,
    content: <span className="text-gray-600 font-medium text-base">{message}</span>,
    okText: 'Confirm',
    cancelText: 'Cancel',
    centered: true,
    className: 'premium-confirm-dialog',
    okButtonProps: {
      className: 'px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20',
    },
    cancelButtonProps: {
      className: 'px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold border-none',
    },
    onOk: accept,
    onCancel: reject,
  });
};

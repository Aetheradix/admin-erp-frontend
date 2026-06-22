import { Modal } from 'antd';
import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';

export const showConfirm = ({
    message,
    header = 'Confirm Action',
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
        icon: React.createElement(InfoCircleOutlined, { className: "text-primary text-3xl" }),
        content: React.createElement('span', { className: "text-gray-600 font-medium text-base" }, message),
        okText: 'Confirm',
        cancelText: 'Cancel',
        centered: true,
        className: 'premium-confirm-dialog',
        okButtonProps: {
            className: 'px-6 py-2.5 bg-primary text-white rounded-lg font-semibold shadow-lg shadow-primary/20',
        } as any,
        cancelButtonProps: {
            className: 'px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold border-none',
        } as any,
        onOk: accept,
        onCancel: reject,
    });
};

import React from 'react';
import { Modal } from 'antd';

interface FormModalProps {
  title: string;
  open: boolean;
  onCancel: () => void;
  children: React.ReactNode;
  width?: number;
}

const FormModal: React.FC<FormModalProps> = ({ title, open, onCancel, children, width = 600 }) => {
  return (
    <Modal
      title={<h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={width}
      classNames={{
        body: '!bg-[#1a1a1a] !border !border-white/10 !rounded-2xl !p-6',
        header: '!bg-transparent !border-b !border-white/10 !pb-4 !mb-6',
      }}
      closeIcon={<span className="text-white/60! hover:text-white! top-6! right-6!">&times;</span>}
    >
      {children}
    </Modal>
  );
};

export default FormModal;

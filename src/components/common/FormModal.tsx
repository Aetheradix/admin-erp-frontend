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
      title={<h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter ">{title}</h3>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={width}
      centered
      classNames={{
        content: '!bg-white/5 !backdrop-blur-3xl !border !border-white/10 !rounded-[2.5rem] !shadow-2xl !p-0 !overflow-hidden',
        body: '!p-10',
        header: '!bg-white/5 !backdrop-blur-md !border-b !border-white/5 !p-8 !mb-0',
      }}
      closeIcon={<span className="text-white/40! hover:text-white! transition-colors text-2xl">&times;</span>}
    >
      {children}
    </Modal>
  );
};

export default FormModal;

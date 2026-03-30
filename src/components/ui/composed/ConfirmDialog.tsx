import { ConfirmDialog as PRConfirmDialog, confirmDialog as prConfirmDialog } from 'primereact/confirmdialog';

export const ConfirmDialog = () => {
  return (
    <PRConfirmDialog 
      pt={{
        root: { className: 'rounded-3xl overflow-hidden border-none shadow-2xl bg-white w-full max-w-md mx-4' },
        header: { className: 'px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none bg-white' },
        content: { className: 'px-8 pb-8 text-gray-600 font-medium text-base bg-white' },
        footer: { className: 'px-8 pb-8 pt-0 flex justify-end gap-3 border-none bg-white' },
        acceptButton: { className: 'px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer' },
        rejectButton: { className: 'px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 border-none cursor-pointer' },
        icon: { className: 'text-3xl text-primary mr-4' },
        message: { className: 'text-base font-medium' }
      }}
    />
  );
};

export const showConfirm = ({ 
  message, 
  header = 'Confirm Action', 
  icon = 'pi pi-info-circle', 
  accept, 
  reject 
}: { 
  message: string; 
  header?: string; 
  icon?: string; 
  accept: () => void; 
  reject?: () => void; 
}) => {
  prConfirmDialog({
    message,
    header,
    icon,
    accept,
    reject
  });
};

import { ConfirmDialog as PRConfirmDialog, confirmDialog as prConfirmDialog } from 'primereact/confirmdialog';

export const ConfirmDialog = () => {
  return (
    <PRConfirmDialog 
      className="max-w-md rounded-shell overflow-hidden"
    />
  );
};

export const showConfirm = ({ 
  message, 
  header, 
  icon = 'pi pi-exclamation-triangle', 
  accept, 
  reject 
}: { 
  message: string; 
  header: string; 
  icon?: string; 
  accept: () => void; 
  reject?: () => void; 
}) => {
  prConfirmDialog({
    message,
    header,
    icon,
    acceptClassName: 'p-button-danger rounded-pill',
    rejectClassName: 'p-button-secondary p-button-text rounded-pill',
    accept,
    reject
  });
};

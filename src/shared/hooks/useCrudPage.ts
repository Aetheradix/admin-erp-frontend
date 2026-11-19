import { useCallback, useState } from 'react';
import { useConfirmAction } from './useConfirmAction';
import { useDisclosure } from './useDisclosure';
import { useSubmitHandler } from './useSubmitHandler';

export function useCrudPage<TEntity>() {
  const { isOpen, open, close, setOpen } = useDisclosure();
  const [editing, setEditing] = useState<TEntity | null>(null);
  const { isSubmitting, submit } = useSubmitHandler();
  const confirm = useConfirmAction();

  const openCreate = useCallback(() => {
    setEditing(null);
    open();
  }, [open]);

  const openEdit = useCallback(
    (entity: TEntity) => {
      setEditing(entity);
      open();
    },
    [open]
  );

  return {
    isOpen,
    editing,
    openCreate,
    openEdit,
    close,
    setOpen,
    isSubmitting,
    submit,
    confirm,
  };
}

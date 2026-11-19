import { useCallback, useState } from 'react';

export interface Disclosure {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (value: boolean) => void;
}

export function useDisclosure(initialOpen = false): Disclosure {
  const [isOpen, setOpen] = useState(initialOpen);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((current) => !current), []);

  return { isOpen, open, close, toggle, setOpen };
}

import { useCallback, useState } from 'react';

export interface UseModalResult {
  visible: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initial = false): UseModalResult {
  const [visible, setVisible] = useState<boolean>(initial);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible((v) => !v), []);

  return { visible, open, close, toggle };
}

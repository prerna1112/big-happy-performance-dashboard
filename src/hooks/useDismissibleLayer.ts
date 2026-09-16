import { useEffect, type RefObject } from 'react';

export const useDismissibleLayer = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onDismiss: () => void,
  enabled: boolean,
): void => {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: PointerEvent): void => {
      if (!ref.current?.contains(event.target as Node)) onDismiss();
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      const trigger = ref.current?.querySelector<HTMLElement>('[aria-expanded="true"]');
      onDismiss();
      window.setTimeout(() => trigger?.focus(), 0);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onDismiss, ref]);
};

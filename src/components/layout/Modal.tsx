import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export const Modal = ({ title, open, onClose, returnFocusRef, children }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
      window.setTimeout(() => (returnFocusRef?.current ?? previousFocusRef.current)?.focus(), 0);
    }
  }, [open, returnFocusRef]);

  return (
    <dialog
      className="modal"
      ref={dialogRef}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        onClose();
      }}
    >
      <div className="modal__header">
        <h2 id="modal-title">{title}</h2>
        <button className="icon-button" type="button" onClick={onClose}>
          <span className="sr-only">Close dialog</span>
          <X aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
};

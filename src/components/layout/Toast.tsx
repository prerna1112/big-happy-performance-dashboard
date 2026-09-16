import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export const Toast = ({ message, onDismiss }: ToastProps) => (
  <div className="toast" role="status" aria-live="polite">
    <CheckCircle2 aria-hidden="true" size={18} />
    <span>{message}</span>
    <button className="icon-button icon-button--small" type="button" onClick={onDismiss}>
      <span className="sr-only">Dismiss notification</span>
      <X aria-hidden="true" size={16} />
    </button>
  </div>
);

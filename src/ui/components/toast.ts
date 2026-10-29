import { h } from '../dom';

export interface ToastController {
  element: HTMLElement;
  success(message: string): void;
  error(message: string): void;
  dispose(): void;
}

export function createToast(): ToastController {
  const status = h('div', { className: 'toast toast--success', role: 'status', 'aria-live': 'polite', hidden: true });
  const alert = h('div', { className: 'toast toast--error', role: 'alert', hidden: true });
  const element = h('div', { className: 'toast-stack', 'aria-label': 'Notificaciones' }, status, alert);
  let successTimeout: ReturnType<typeof setTimeout> | undefined;

  function clearSuccessTimeout(): void {
    if (successTimeout !== undefined) clearTimeout(successTimeout);
    successTimeout = undefined;
  }

  return {
    element,
    success(message) {
      clearSuccessTimeout();
      status.textContent = message;
      status.hidden = false;
      alert.hidden = true;
      alert.textContent = '';
      successTimeout = setTimeout(() => {
        status.hidden = true;
        status.textContent = '';
        successTimeout = undefined;
      }, 4000);
    },
    error(message) {
      clearSuccessTimeout();
      alert.textContent = message;
      alert.hidden = false;
      status.hidden = true;
      status.textContent = '';
    },
    dispose() {
      clearSuccessTimeout();
    },
  };
}

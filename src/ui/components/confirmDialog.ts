import { h } from '../dom';

export function confirmDialog(options: { title: string; message: string; confirmLabel: string }): Promise<boolean> {
  return new Promise((resolve) => {
    const titleId = `confirm-title-${crypto.randomUUID()}`;
    const dialog = h('dialog', { className: 'confirm-dialog', 'aria-labelledby': titleId }) as HTMLDialogElement;
    const cancel = h('button', { type: 'button', className: 'button button--secondary', 'data-action': 'cancel' }, 'Cancelar') as HTMLButtonElement;
    const confirm = h('button', { type: 'button', className: 'button button--danger', 'data-action': 'confirm' }, options.confirmLabel) as HTMLButtonElement;
    dialog.append(
      h('div', { className: 'dialog-content' },
        h('h2', { id: titleId }, options.title),
        h('p', null, options.message),
        h('div', { className: 'form-actions' }, cancel, confirm)),
    );

    let finished = false;
    const finish = (accepted: boolean) => {
      if (finished) return;
      finished = true;
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      dialog.remove();
      resolve(accepted);
    };
    cancel.addEventListener('click', () => finish(false));
    confirm.addEventListener('click', () => finish(true));
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); finish(false); });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(false);
      }
    });

    document.body.append(dialog);
    try {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } catch {
      dialog.setAttribute('open', '');
    }
    cancel.focus();
  });
}

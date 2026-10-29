import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { makeTicket } from '../../helpers';
import { mountForTest } from '../../ui-test-utils';

beforeEach(() => { document.body.replaceChildren(); });

describe('eliminación de tickets', () => {
  it('muestra el título en el diálogo; cancelar conserva y confirmar elimina', async () => {
    const ticket = makeTicket();
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });
    window.location.hash = `#/tickets/${ticket.id}`;
    const { root, unmount } = mountForTest(service);
    root.querySelector<HTMLButtonElement>('button[data-action="delete"]')!.click();
    const dialog = document.querySelector<HTMLDialogElement>('dialog');
    expect(dialog?.textContent).toContain(ticket.titulo);
    expect(document.activeElement).toBe(dialog?.querySelector('[data-action="cancel"]'));
    dialog?.querySelector<HTMLButtonElement>('[data-action="cancel"]')?.click();
    expect(await Promise.resolve(true)).toBe(true);
    expect(service.get(ticket.id)).toBeDefined();
    expect(document.querySelector('dialog')).toBeNull();

    root.querySelector<HTMLButtonElement>('button[data-action="delete"]')!.click();
    document.querySelector<HTMLButtonElement>('dialog [data-action="confirm"]')!.click();
    await Promise.resolve();
    expect(service.get(ticket.id)).toBeUndefined();
    expect(window.location.hash).toBe('#/tickets');
    expect(root.textContent).toContain('Ticket eliminado.');
    unmount();
  });

  it('Escape cancela el diálogo y eliminar el último ticket devuelve al estado vacío', async () => {
    const ticket = makeTicket();
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });
    window.location.hash = `#/tickets/${ticket.id}`;
    const { root, unmount } = mountForTest(service);
    root.querySelector<HTMLButtonElement>('button[data-action="delete"]')!.click();
    document.querySelector('dialog')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await Promise.resolve();
    expect(service.get(ticket.id)).toBeDefined();
    root.querySelector<HTMLButtonElement>('button[data-action="delete"]')!.click();
    document.querySelector<HTMLButtonElement>('dialog [data-action="confirm"]')!.click();
    await Promise.resolve();
    expect(service.list()).toEqual([]);
    expect(root.textContent).toContain('Aún no hay tickets');
    unmount();
  });
});

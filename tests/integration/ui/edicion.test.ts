import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { makeTicket } from '../../helpers';
import { mountForTest, setField, submitForm } from '../../ui-test-utils';

beforeEach(() => { document.body.replaceChildren(); });

describe('edición de tickets', () => {
  it('precarga y guarda cambios, volviendo al detalle con confirmación', () => {
    const ticket = makeTicket();
    const service = createTicketService({ repository: createMemoryRepository([ticket]), clock: { now: () => new Date('2026-10-29T14:00:00.000Z') } });
    window.location.hash = `#/tickets/${ticket.id}/editar`;
    const { root, unmount } = mountForTest(service);
    expect(root.querySelector<HTMLInputElement>('[name="titulo"]')?.value).toBe(ticket.titulo);
    setField('descripcion', 'La impresora muestra un error al iniciar la impresión.', root);
    setField('prioridad', 'critica', root);
    submitForm(root);
    expect(window.location.hash).toBe(`#/tickets/${ticket.id}`);
    expect(root.textContent).toContain('Ticket TK-0001 actualizado.');
    expect(service.get(ticket.id)?.prioridad).toBe('critica');
    unmount();
  });

  it('muestra los mismos errores de alta y cancelar vuelve sin guardar', () => {
    const ticket = makeTicket();
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });
    window.location.hash = `#/tickets/${ticket.id}/editar`;
    const { root, unmount } = mountForTest(service);
    setField('titulo', 'abc', root);
    submitForm(root);
    expect(root.textContent).toContain('El título debe tener entre 5 y 100 caracteres.');
    root.querySelector<HTMLButtonElement>('button[type="button"]')!.click();
    expect(window.location.hash).toBe(`#/tickets/${ticket.id}`);
    expect(service.get(ticket.id)).toEqual(ticket);
    unmount();
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { makeTicket } from '../../helpers';
import { mountForTest } from '../../ui-test-utils';

beforeEach(() => { document.body.replaceChildren(); window.location.hash = '#/tickets'; });

describe('listado y detalle', () => {
  it('invita a registrar cuando no hay tickets', () => {
    const { root, unmount } = mountForTest(createTicketService({ repository: createMemoryRepository() }));
    expect(root.textContent).toContain('Aún no hay tickets');
    expect(root.querySelector('.empty-state a[href="#/tickets/nuevo"]')?.textContent).toContain('Registrar el primer ticket');
    unmount();
  });

  it('muestra los campos principales en orden descendente y comunica texto además de color', () => {
    const older = makeTicket({ id: '11111111-1111-4111-8111-111111111111', codigo: 1 });
    const newer = makeTicket({ id: '22222222-2222-4222-8222-222222222222', codigo: 2, creadoEn: '2026-10-30T10:00:00.000Z', titulo: 'Error de correo', prioridad: 'critica' });
    const { root, unmount } = mountForTest(createTicketService({ repository: createMemoryRepository([older, newer]) }));
    const titles = [...root.querySelectorAll('.ticket-title')].map((item) => item.textContent?.trim());
    expect(titles.slice(0, 2)).toEqual(['Error de correo', 'Impresora no imprime']);
    expect(root.textContent).toContain('TK-0002');
    expect(root.textContent).toContain('Hardware');
    expect(root.textContent).toContain('Crítica');
    expect(root.textContent).toContain('Pendiente');
    unmount();
  });

  it('muestra el detalle completo y enlaza al listado si no encuentra el id', () => {
    const ticket = makeTicket();
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });
    window.location.hash = `#/tickets/${ticket.id}`;
    const { root, unmount } = mountForTest(service);
    expect(root.querySelector('h1')?.textContent).toBe(ticket.titulo);
    expect(root.textContent).toContain(ticket.descripcion);
    expect(root.textContent).toContain('Creado');
    unmount();

    window.location.hash = '#/tickets/no-existe';
    const missing = mountForTest(service);
    expect(missing.root.textContent).toContain('Ticket no encontrado');
    expect(missing.root.querySelector('a[href="#/tickets"]')).not.toBeNull();
    missing.unmount();
  });
});

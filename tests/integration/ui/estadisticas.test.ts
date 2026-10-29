import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { makeTicket } from '../../helpers';
import { mountForTest } from '../../ui-test-utils';

beforeEach(() => { document.body.replaceChildren(); window.location.hash = '#/estadisticas'; });

describe('estadísticas', () => {
  it('muestra tarjetas con cantidades y porcentajes, y barras etiquetadas', () => {
    const tickets = [
      makeTicket({ id: '11111111-1111-4111-8111-111111111111', estado: 'pendiente', categoria: 'hardware' }),
      makeTicket({ id: '22222222-2222-4222-8222-222222222222', estado: 'resuelto', resueltoEn: '2026-10-29T11:00:00.000Z', categoria: 'red' }),
    ];
    const { root, unmount } = mountForTest(createTicketService({ repository: createMemoryRepository(tickets) }));
    expect(root.querySelector('[data-stat="total"]')?.textContent).toContain('2');
    expect(root.querySelector('[data-stat="pendiente"]')?.textContent).toContain('1');
    expect(root.querySelector('[data-stat="pendiente"]')?.textContent).toContain('50%');
    expect(root.querySelector('[data-stat="resuelto"]')?.textContent).toContain('50%');
    expect(root.querySelector('[role="img"][aria-label="Tickets por categoría"]')).not.toBeNull();
    expect(root.querySelector('[role="img"][aria-label="Tickets por prioridad"]')).not.toBeNull();
    expect(root.textContent).toContain('Hardware');
    expect(root.textContent).toContain('Crítica');
    unmount();
  });

  it('actualiza tras crear, cambiar el estado o eliminar y muestra ceros si no hay tickets', () => {
    const ticket = makeTicket();
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });
    const { root, unmount } = mountForTest(service);
    expect(root.querySelector('[data-stat="total"]')?.textContent).toContain('1');
    service.create({ titulo: 'Error de correo', descripcion: 'No se reciben mensajes nuevos.', categoria: 'software', prioridad: 'media' });
    expect(root.querySelector('[data-stat="total"]')?.textContent).toContain('2');
    service.changeStatus(ticket.id, 'resuelto');
    expect(root.querySelector('[data-stat="resuelto"]')?.textContent).toContain('50%');
    service.remove(ticket.id);
    expect(root.querySelector('[data-stat="total"]')?.textContent).toContain('1');
    service.remove(service.list()[0]!.id);
    expect(root.textContent).toContain('Aún no hay datos');
    expect(root.querySelector('[data-stat="total"]')?.textContent).toContain('0');
    unmount();
  });
});

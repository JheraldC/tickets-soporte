import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { makeTicket } from '../../helpers';
import { mountForTest } from '../../ui-test-utils';

beforeEach(() => { document.body.replaceChildren(); window.location.hash = '#/tickets'; });
afterEach(() => { vi.useRealTimers(); });

describe('búsqueda y filtros del listado', () => {
  it('aplica la búsqueda después de 150 ms, combina filtros y muestra resultados', () => {
    vi.useFakeTimers();
    const tickets = [
      makeTicket({ id: '11111111-1111-4111-8111-111111111111', titulo: 'Error de configuración del correo', categoria: 'software', estado: 'pendiente' }),
      makeTicket({ id: '22222222-2222-4222-8222-222222222222', titulo: 'Error de configuración de impresora', categoria: 'hardware', estado: 'en_proceso' }),
    ];
    const { root, unmount } = mountForTest(createTicketService({ repository: createMemoryRepository(tickets) }));
    const search = root.querySelector<HTMLInputElement>('[name="texto"]')!;
    search.value = 'configuracion';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(root.querySelectorAll('.ticket-card')).toHaveLength(2);
    vi.advanceTimersByTime(150);
    expect(root.querySelectorAll('.ticket-card')).toHaveLength(2);
    root.querySelector<HTMLSelectElement>('[name="estado"]')!.value = 'pendiente';
    root.querySelector<HTMLSelectElement>('[name="estado"]')!.dispatchEvent(new Event('change', { bubbles: true }));
    root.querySelector<HTMLSelectElement>('[name="categoria"]')!.value = 'software';
    root.querySelector<HTMLSelectElement>('[name="categoria"]')!.dispatchEvent(new Event('change', { bubbles: true }));
    expect(root.querySelectorAll('.ticket-card')).toHaveLength(1);
    expect(root.textContent).toContain('1 resultado');
    expect(root.textContent).toContain('Error de configuración del correo');
    unmount();
  });

  it('muestra sin resultados y Limpiar restaura la colección completa', () => {
    vi.useFakeTimers();
    const { root, unmount } = mountForTest(createTicketService({ repository: createMemoryRepository([makeTicket()]) }));
    const search = root.querySelector<HTMLInputElement>('[name="texto"]')!;
    search.value = 'sin coincidencias';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(150);
    expect(root.textContent).toContain('Sin resultados');
    root.querySelector<HTMLButtonElement>('[data-action="clear-filters"]')!.click();
    expect(root.querySelectorAll('.ticket-card')).toHaveLength(1);
    expect(search.value).toBe('');
    unmount();
  });

  it('actualiza los resultados al cambiar estado o editar con filtros activos', () => {
    const ticket = makeTicket();
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });
    const { root, unmount } = mountForTest(service);
    const state = root.querySelector<HTMLSelectElement>('[name="estado"]')!;
    state.value = 'pendiente';
    state.dispatchEvent(new Event('change', { bubbles: true }));
    expect(root.querySelectorAll('.ticket-card')).toHaveLength(1);
    service.changeStatus(ticket.id, 'resuelto');
    expect(root.querySelectorAll('.ticket-card')).toHaveLength(0);
    expect(root.textContent).toContain('Sin resultados');
    service.update(ticket.id, { titulo: 'Falla de red en oficina', descripcion: ticket.descripcion, categoria: 'hardware', prioridad: 'media' });
    expect(root.textContent).toContain('Sin resultados');
    service.changeStatus(ticket.id, 'pendiente');
    expect(root.textContent).toContain('Falla de red en oficina');
    unmount();
  });
});

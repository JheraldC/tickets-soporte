import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorageRepository } from '../../../src/storage/localStorageRepository';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { makeTicket } from '../../helpers';
import { mountForTest } from '../../ui-test-utils';

beforeEach(() => { window.localStorage.clear(); document.body.replaceChildren(); });

describe('cambio de estado', () => {
  it('permite cambiar el estado desde el detalle y persiste la fecha de resolución', () => {
    const ticket = makeTicket();
    const service = createTicketService({
      repository: createLocalStorageRepository(window.localStorage),
      clock: { now: () => new Date('2026-10-29T13:00:00.000Z') },
    });
    service.create({ titulo: ticket.titulo, descripcion: ticket.descripcion, categoria: ticket.categoria, prioridad: ticket.prioridad });
    const created = service.list()[0]!;
    window.location.hash = `#/tickets/${created.id}`;
    let mounted = mountForTest(service);
    const setStatus = (state: string) => {
      const select = mounted.root.querySelector<HTMLSelectElement>('[name="estado"]');
      expect(select).not.toBeNull();
      select!.value = state;
      select!.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setStatus('en_proceso');
    expect(service.get(created.id)?.estado).toBe('en_proceso');
    setStatus('resuelto');
    expect(service.get(created.id)?.resueltoEn).toBe('2026-10-29T13:00:00.000Z');
    expect(mounted.root.textContent).toContain('Resuelto');
    setStatus('pendiente');
    expect(service.get(created.id)?.resueltoEn).toBeNull();
    mounted.unmount();
    const restored = createTicketService({ repository: createLocalStorageRepository(window.localStorage) });
    expect(restored.get(created.id)?.estado).toBe('pendiente');
    expect(restored.get(created.id)?.resueltoEn).toBeNull();
  });

  it('cambia el estado del listado con un único control accesible', () => {
    const ticket = makeTicket();
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });
    window.location.hash = '#/tickets';
    const mounted = mountForTest(service);
    const select = mounted.root.querySelector<HTMLSelectElement>('[aria-label="Cambiar estado de TK-0001"]');
    expect(select).not.toBeNull();
    expect(select?.options).toHaveLength(3);
    select!.value = 'en_proceso';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    expect(service.get(ticket.id)?.estado).toBe('en_proceso');
    expect(mounted.root.textContent).toContain('Estado actualizado');
    mounted.unmount();
  });
});

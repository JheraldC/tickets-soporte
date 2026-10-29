import { describe, expect, it, vi } from 'vitest';
import { createTicketService } from '../../../src/domain/ticketService';
import { StorageError } from '../../../src/domain/ports';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { makeTicket } from '../../helpers';

describe('ticketService.changeStatus', () => {
  it('devuelve not-found e invalid-status para argumentos no válidos', () => {
    const service = createTicketService({ repository: createMemoryRepository() });
    expect(service.changeStatus('missing', 'resuelto')).toEqual({ ok: false, error: 'not-found' });
    expect(service.changeStatus('missing', 'inexistente' as never)).toEqual({ ok: false, error: 'invalid-status' });
  });

  it('mismo estado responde ok sin guardar ni notificar', () => {
    const ticket = makeTicket();
    const saveAll = vi.fn();
    const service = createTicketService({ repository: { load: () => ({ tickets: [ticket] }), saveAll } });
    const listener = vi.fn();
    service.subscribe(listener);
    expect(service.changeStatus(ticket.id, 'pendiente')).toMatchObject({ ok: true, value: ticket });
    expect(saveAll).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
  });

  it('revierte el estado en memoria si saveAll falla', () => {
    const ticket = makeTicket();
    const failure = new StorageError('write-failed');
    const repository = { load: () => ({ tickets: [ticket] }), saveAll: () => { throw failure; } };
    const service = createTicketService({ repository, clock: { now: () => new Date('2026-10-29T13:00:00.000Z') } });
    expect(() => service.changeStatus(ticket.id, 'resuelto')).toThrow(failure);
    expect(service.get(ticket.id)).toEqual(ticket);
  });
});

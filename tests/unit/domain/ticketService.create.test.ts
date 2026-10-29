import { describe, expect, it, vi } from 'vitest';
import { createTicketService } from '../../../src/domain/ticketService';
import { StorageError } from '../../../src/domain/ports';
import type { Ticket } from '../../../src/domain/types';
import { makeTicket } from '../../helpers';

const input = { titulo: '  Falla de red  ', descripcion: '  No responde el router del piso.  ', categoria: 'red', prioridad: 'alta' };
const now = new Date('2026-10-29T12:30:00.000Z');

describe('ticketService.create', () => {
  it('crea tickets válidos con estado inicial, código siguiente, fecha, id y texto recortado', () => {
    const existing: Ticket[] = [makeTicket({ codigo: 7 })];
    const repository = { load: () => ({ tickets: existing }), saveAll: vi.fn() };
    const service = createTicketService({ repository, clock: { now: () => now }, ids: { next: () => '33333333-3333-4333-8333-333333333333' } });
    const result = service.create(input);
    expect(result).toMatchObject({
      ok: true,
      value: {
        id: '33333333-3333-4333-8333-333333333333',
        codigo: 8,
        titulo: 'Falla de red',
        descripcion: 'No responde el router del piso.',
        estado: 'pendiente',
        creadoEn: now.toISOString(),
        actualizadoEn: now.toISOString(),
        resueltoEn: null,
      },
    });
    expect(repository.saveAll).toHaveBeenCalledTimes(1);
  });

  it('empieza en 1 si no hay tickets y permite títulos duplicados', () => {
    let id = 0;
    const repository = { load: () => ({ tickets: [makeTicket({ titulo: 'Falla de red' })] }), saveAll: vi.fn() };
    const service = createTicketService({ repository, ids: { next: () => `id-${++id}` }, clock: { now: () => now } });
    expect(service.create(input)).toMatchObject({ ok: true, value: { codigo: 2 } });
    const empty = createTicketService({ repository: { load: () => ({ tickets: [] }), saveAll: vi.fn() }, ids: { next: () => 'id' }, clock: { now: () => now } });
    expect(empty.create(input)).toMatchObject({ ok: true, value: { codigo: 1 } });
  });

  it('rechaza entrada inválida sin llamar al repositorio', () => {
    const saveAll = vi.fn();
    const service = createTicketService({ repository: { load: () => ({ tickets: [] }), saveAll } });
    expect(service.create({ ...input, titulo: 'abc' })).toMatchObject({ ok: false, error: { titulo: expect.any(String) } });
    expect(saveAll).not.toHaveBeenCalled();
  });

  it('propaga el fallo de guardado sin cambiar la lista en memoria', () => {
    const original = makeTicket();
    const failure = new StorageError('write-failed');
    const saveAll = vi.fn(() => { throw failure; });
    const service = createTicketService({ repository: { load: () => ({ tickets: [original] }), saveAll }, clock: { now: () => now } });
    expect(() => service.create(input)).toThrow(failure);
    expect(service.list()).toEqual([original]);
  });
});

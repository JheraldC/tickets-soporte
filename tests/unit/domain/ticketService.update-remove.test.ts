import { describe, expect, it, vi } from 'vitest';
import { createTicketService } from '../../../src/domain/ticketService';
import { StorageError } from '../../../src/domain/ports';
import { makeTicket } from '../../helpers';

const input = { titulo: 'Impresora del almacén', descripcion: 'La impresora no responde al enviar documentos.', categoria: 'hardware', prioridad: 'critica' };
const now = new Date('2026-10-29T14:00:00.000Z');

describe('ticketService.update y remove', () => {
  it('actualiza campos editables sin cambiar id, código ni fecha de creación', () => {
    const ticket = makeTicket({ estado: 'resuelto', resueltoEn: '2026-10-29T11:00:00.000Z' });
    const service = createTicketService({ repository: { load: () => ({ tickets: [ticket] }), saveAll: vi.fn() }, clock: { now: () => now } });
    const result = service.update(ticket.id, input);
    expect(result).toMatchObject({ ok: true, value: {
      id: ticket.id, codigo: ticket.codigo, creadoEn: ticket.creadoEn, actualizadoEn: now.toISOString(),
      estado: 'resuelto', resueltoEn: ticket.resueltoEn, titulo: input.titulo,
    } });
  });

  it('no guarda entrada inválida y devuelve not-found si el ticket no existe', () => {
    const saveAll = vi.fn();
    const service = createTicketService({ repository: { load: () => ({ tickets: [makeTicket()] }), saveAll } });
    expect(service.update('11111111-1111-4111-8111-111111111111', { ...input, titulo: 'abc' })).toMatchObject({ ok: false, error: { titulo: expect.any(String) } });
    expect(service.update('missing', input)).toEqual({ ok: false, error: 'not-found' });
    expect(saveAll).not.toHaveBeenCalled();
  });

  it('revierte la actualización y la eliminación si falla el almacenamiento', () => {
    const ticket = makeTicket();
    const failure = new StorageError('write-failed');
    const service = createTicketService({ repository: { load: () => ({ tickets: [ticket] }), saveAll: () => { throw failure; } }, clock: { now: () => now } });
    expect(() => service.update(ticket.id, input)).toThrow(failure);
    expect(service.get(ticket.id)).toEqual(ticket);
    expect(() => service.remove(ticket.id)).toThrow(failure);
    expect(service.get(ticket.id)).toEqual(ticket);
  });

  it('elimina y persiste; eliminar un id ausente devuelve not-found', () => {
    const saveAll = vi.fn();
    const ticket = makeTicket();
    const service = createTicketService({ repository: { load: () => ({ tickets: [ticket] }), saveAll } });
    expect(service.remove(ticket.id)).toEqual({ ok: true, value: undefined });
    expect(service.list()).toEqual([]);
    expect(saveAll).toHaveBeenCalledWith([]);
    expect(service.remove(ticket.id)).toEqual({ ok: false, error: 'not-found' });
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { createDemoTickets, seedDemoTickets } from '../../../src/data/demoTickets';
import { CATEGORIAS, ESTADOS, PRIORIDADES, STORAGE_KEY } from '../../../src/domain/constants';
import { createTicketService } from '../../../src/domain/ticketService';
import { isValidTicket } from '../../../src/domain/validation';
import { createLocalStorageRepository } from '../../../src/storage/localStorageRepository';
import { makeTicket } from '../../helpers';

const now = new Date('2026-11-02T12:00:00.000Z');

beforeEach(() => localStorage.clear());

describe('datos de prueba', () => {
  it('ofrece veinte tickets válidos con todas las categorías, prioridades y estados', () => {
    const tickets = createDemoTickets(now);
    expect(tickets).toHaveLength(20);
    expect(tickets.every(isValidTicket)).toBe(true);
    expect(new Set(tickets.map((ticket) => ticket.id)).size).toBe(20);
    expect(new Set(tickets.map((ticket) => ticket.codigo)).size).toBe(20);
    expect(new Set(tickets.map((ticket) => ticket.categoria))).toEqual(new Set(CATEGORIAS));
    expect(new Set(tickets.map((ticket) => ticket.prioridad))).toEqual(new Set(PRIORIDADES));
    expect(new Set(tickets.map((ticket) => ticket.estado))).toEqual(new Set(ESTADOS));
    expect(tickets.every((ticket) => Date.parse(ticket.actualizadoEn) <= now.getTime())).toBe(true);
  });

  it('persiste los datos y permite consultarlos y continuar la numeración', () => {
    expect(seedDemoTickets(localStorage, now)).toBe(20);
    const repository = createLocalStorageRepository(localStorage);
    expect(repository.load().warning).toBeUndefined();
    const service = createTicketService({ repository, clock: { now: () => now } });
    expect(service.stats()).toMatchObject({
      total: 20,
      porEstado: { pendiente: { cantidad: 8 }, en_proceso: { cantidad: 6 }, resuelto: { cantidad: 6 } },
    });
    expect(service.query({ texto: 'impresora', estado: 'todos', categoria: 'todas', prioridad: 'todas' })).toHaveLength(1);
    expect(service.create(makeTicket())).toMatchObject({ ok: true, value: { codigo: 21, estado: 'pendiente' } });
  });

  it('no duplica tickets ni revierte las ediciones al volver a cargar', () => {
    seedDemoTickets(localStorage, now);
    const repository = createLocalStorageRepository(localStorage);
    const service = createTicketService({ repository, clock: { now: () => now } });
    const ticket = service.list()[0]!;
    service.update(ticket.id, { ...ticket, titulo: 'Ticket de prueba editado' });
    const saved = localStorage.getItem(STORAGE_KEY);
    expect(seedDemoTickets(localStorage, now)).toBe(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
    expect(repository.load().tickets).toHaveLength(20);
  });

  it.each([
    ['tickets existentes', JSON.stringify({ version: 1, tickets: [makeTicket()] })],
    ['listado vaciado a propósito', JSON.stringify({ version: 1, tickets: [] })],
    ['datos dañados pendientes de recuperación', '{roto'],
  ])('conserva sin modificaciones: %s', (_label, raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(seedDemoTickets(localStorage, now)).toBe(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });
});

import { StorageError, type Clock, type IdGenerator, type TicketRepository } from './ports';
import { validateTicketInput } from './validation';
import { ESTADOS } from './constants';
import { applyStatusChange } from './status';
import { filterTickets } from './query';
import { computeStats } from './stats';
import type { Estadisticas, Estado, Result, Ticket, TicketInput, TicketQuery, ValidationErrors } from './types';

export interface TicketService {
  list(): readonly Ticket[];
  get(id: string): Ticket | undefined;
  create(input: TicketInput): Result<Ticket, ValidationErrors>;
  update(id: string, input: TicketInput): Result<Ticket, ValidationErrors | 'not-found'>;
  changeStatus(id: string, estado: Estado): Result<Ticket, 'not-found' | 'invalid-status'>;
  remove(id: string): Result<void, 'not-found'>;
  query(criteria: TicketQuery): readonly Ticket[];
  stats(): Estadisticas;
  subscribe(listener: (tickets: readonly Ticket[]) => void): () => void;
  getLoadWarning(): StorageError | undefined;
}

export function createTicketService(deps: { repository: TicketRepository; clock?: Clock; ids?: IdGenerator }): TicketService {
  const clock = deps.clock ?? { now: () => new Date() };
  const ids = deps.ids ?? { next: () => globalThis.crypto?.randomUUID?.() ?? `ticket-${Date.now()}-${Math.random().toString(16).slice(2)}` };
  const loaded = deps.repository.load();
  let tickets = loaded.tickets.map((ticket) => ({ ...ticket }));
  const listeners = new Set<(tickets: readonly Ticket[]) => void>();

  function sorted(source: readonly Ticket[]): Ticket[] {
    return source.map((ticket) => ({ ...ticket })).sort((a, b) => Date.parse(b.creadoEn) - Date.parse(a.creadoEn));
  }

  function commit(next: Ticket[]): void {
    deps.repository.saveAll(next);
    tickets = next.map((ticket) => ({ ...ticket }));
    const snapshot = sorted(tickets);
    for (const listener of listeners) listener(snapshot);
  }

  return {
    list: () => sorted(tickets),
    get: (id) => {
      const found = tickets.find((ticket) => ticket.id === id);
      return found ? { ...found } : undefined;
    },
    create(input) {
      const validation = validateTicketInput(input);
      if (!validation.ok) return validation;
      const timestamp = clock.now().toISOString();
      const created: Ticket = {
        ...validation.value,
        id: ids.next(),
        codigo: tickets.reduce((maximum, ticket) => Math.max(maximum, ticket.codigo), 0) + 1,
        estado: 'pendiente',
        creadoEn: timestamp,
        actualizadoEn: timestamp,
        resueltoEn: null,
      };
      commit([...tickets, created]);
      return { ok: true, value: { ...created } };
    },
    update(id, input) {
      const current = tickets.find((ticket) => ticket.id === id);
      if (!current) return { ok: false, error: 'not-found' };
      const validation = validateTicketInput(input);
      if (!validation.ok) return validation;
      const updated: Ticket = { ...current, ...validation.value, actualizadoEn: clock.now().toISOString() };
      commit(tickets.map((ticket) => ticket.id === id ? updated : ticket));
      return { ok: true, value: { ...updated } };
    },
    changeStatus(id, estado) {
      if (!ESTADOS.includes(estado)) return { ok: false, error: 'invalid-status' };
      const current = tickets.find((ticket) => ticket.id === id);
      if (!current) return { ok: false, error: 'not-found' };
      if (current.estado === estado) return { ok: true, value: { ...current } };
      const changed = applyStatusChange(current, estado, clock.now());
      commit(tickets.map((ticket) => ticket.id === id ? changed : ticket));
      return { ok: true, value: { ...changed } };
    },
    remove(id) {
      if (!tickets.some((ticket) => ticket.id === id)) return { ok: false, error: 'not-found' };
      commit(tickets.filter((ticket) => ticket.id !== id));
      return { ok: true, value: undefined };
    },
    query: (criteria) => filterTickets(tickets, criteria),
    stats: () => computeStats(tickets),
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getLoadWarning: () => loaded.warning,
  };
}

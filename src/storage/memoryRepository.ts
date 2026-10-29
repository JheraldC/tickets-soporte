import type { Ticket } from '../domain/types';
import type { TicketRepository } from '../domain/ports';

function copyTickets(tickets: readonly Ticket[]): Ticket[] {
  return tickets.map((ticket) => ({ ...ticket }));
}

export function createMemoryRepository(initial: Ticket[] = []): TicketRepository {
  let tickets = copyTickets(initial);
  return {
    load: () => ({ tickets: copyTickets(tickets) }),
    saveAll: (next) => { tickets = copyTickets(next); },
  };
}

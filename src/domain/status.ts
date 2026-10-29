import type { Estado, Ticket } from './types';

export function applyStatusChange(ticket: Ticket, estado: Estado, now: Date): Ticket {
  if (ticket.estado === estado) return ticket;
  const timestamp = now.toISOString();
  return {
    ...ticket,
    estado,
    actualizadoEn: timestamp,
    resueltoEn: estado === 'resuelto' ? timestamp : null,
  };
}

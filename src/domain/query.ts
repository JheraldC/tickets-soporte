import { CATEGORIES, PRIORITIES, STATES } from './constants';
import type { Estado, Ticket, TicketQuery } from './types';

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-PE').trim();
}

export function filterTickets(tickets: readonly Ticket[], query: TicketQuery): Ticket[] {
  const text = normalizeText(query.texto);
  const filtered = tickets.filter((ticket) => {
    const matchesText = !text || normalizeText(`${ticket.titulo} ${ticket.descripcion}`).includes(text);
    const matchesState = query.estado === 'todos' || ticket.estado === query.estado;
    const matchesCategory = query.categoria === 'todas' || ticket.categoria === query.categoria;
    const matchesPriority = query.prioridad === 'todas' || ticket.prioridad === query.prioridad;
    return matchesText && matchesState && matchesCategory && matchesPriority;
  });
  return filtered.sort((a, b) => Date.parse(b.creadoEn) - Date.parse(a.creadoEn));
}

export const FILTER_STATES: readonly { value: Estado | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  ...STATES,
];

export const FILTER_CATEGORIES = [
  { value: 'todas', label: 'Todas las categorías' },
  ...CATEGORIES,
] as const;

export const FILTER_PRIORITIES = [
  { value: 'todas', label: 'Todas las prioridades' },
  ...PRIORITIES,
] as const;

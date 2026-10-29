import { CATEGORIES, ESTADOS, PRIORITIES } from './constants';
import type { Categoria, Estado, Estadisticas, Prioridad, Ticket } from './types';

export function computeStats(tickets: readonly Ticket[]): Estadisticas {
  const total = tickets.length;
  const counts = { pendiente: 0, en_proceso: 0, resuelto: 0 } satisfies Record<Estado, number>;
  const byCategory = { hardware: 0, software: 0, red: 0, cuentas: 0, otro: 0 } satisfies Record<Categoria, number>;
  const byPriority = { baja: 0, media: 0, alta: 0, critica: 0 } satisfies Record<Prioridad, number>;

  for (const ticket of tickets) {
    counts[ticket.estado] += 1;
    byCategory[ticket.categoria] += 1;
    byPriority[ticket.prioridad] += 1;
  }

  const porEstado = Object.fromEntries(ESTADOS.map((state) => [
    state,
    {
      cantidad: counts[state],
      porcentaje: total === 0 ? 0 : Math.round((counts[state] / total) * 1000) / 10,
    },
  ])) as Estadisticas['porEstado'];

  return {
    total,
    porEstado,
    porCategoria: Object.fromEntries(CATEGORIES.map(({ value }) => [value, byCategory[value]])) as Record<Categoria, number>,
    porPrioridad: Object.fromEntries(PRIORITIES.map(({ value }) => [value, byPriority[value]])) as Record<Prioridad, number>,
  };
}

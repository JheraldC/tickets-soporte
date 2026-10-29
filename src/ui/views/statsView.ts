import { CATEGORIES, PRIORITIES, STATES } from '../../domain/constants';
import type { TicketService } from '../../domain/ticketService';
import type { Estadisticas } from '../../domain/types';
import { h } from '../dom';

function summaryCard(key: string, label: string, count: number, percentage?: number): HTMLElement {
  return h('article', { className: `stat-card${key === 'total' ? ' stat-card--total' : ''}`, 'data-stat': key },
    h('h2', null, label),
    h('p', { className: 'stat-number' }, String(count)),
    percentage === undefined ? null : h('p', { className: 'stat-percentage' }, `${percentage}% del total`));
}

function chart(title: string, ariaLabel: string, rows: readonly { label: string; count: number }[], total: number): HTMLElement {
  const chartElement = h('div', { className: 'bar-chart', role: 'img', 'aria-label': ariaLabel });
  const max = Math.max(1, ...rows.map((row) => row.count));
  for (const row of rows) {
    const fill = h('span', { className: 'bar-fill' });
    fill.style.width = `${total === 0 ? 0 : Math.round((row.count / max) * 100)}%`;
    chartElement.append(h('div', { className: 'bar-row' },
      h('span', { className: 'bar-label' }, row.label),
      h('span', { className: 'bar-track', 'aria-hidden': 'true' }, fill),
      h('strong', { className: 'bar-value' }, String(row.count))));
  }
  return h('section', { className: 'chart-panel' }, h('h2', null, title), chartElement);
}

export function createStatsView(service: TicketService): HTMLElement {
  const stats: Estadisticas = service.stats();
  const summary = h('div', { className: 'stat-grid' },
    summaryCard('total', 'Total de tickets', stats.total),
    ...STATES.map(({ value, label }) => summaryCard(value, label, stats.porEstado[value].cantidad, stats.porEstado[value].porcentaje)));
  const categoryRows = CATEGORIES.map(({ value, label }) => ({ label, count: stats.porCategoria[value] }));
  const priorityRows = PRIORITIES.map(({ value, label }) => ({ label, count: stats.porPrioridad[value] }));
  return h('section', { className: 'page-section stats-page' },
    h('div', { className: 'page-heading' },
      h('div', null, h('h1', null, 'Estadísticas'), h('p', { className: 'lead' }, 'Resumen de las incidencias registradas.'))),
    stats.total === 0 ? h('p', { className: 'no-stats', role: 'status' }, 'Aún no hay datos. Las estadísticas aparecerán al registrar tickets.') : null,
    summary,
    h('div', { className: 'chart-grid' },
      chart('Tickets por categoría', 'Tickets por categoría', categoryRows, stats.total),
      chart('Tickets por prioridad', 'Tickets por prioridad', priorityRows, stats.total)),
  );
}

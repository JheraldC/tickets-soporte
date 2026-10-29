import { CATEGORIES } from '../../domain/constants';
import type { TicketService } from '../../domain/ticketService';
import type { Estado, Ticket } from '../../domain/types';
import { STATES } from '../../domain/constants';
import { createBadge, formatCodigo } from '../components/badge';
import { formatDate, h } from '../dom';
import type { ToastController } from '../components/toast';
import { createFilterBar } from '../components/filterBar';
import type { TicketQuery } from '../../domain/types';
import type { TicketQueryStore } from '../state';

function statusControl(ticket: Ticket, service: TicketService, toast: ToastController): HTMLElement {
  const code = formatCodigo(ticket.codigo);
  const select = h('select', {
    className: 'quick-status',
    'aria-label': `Cambiar estado de ${code}`,
    onChange: (event: Event) => {
      const next = (event.currentTarget as HTMLSelectElement).value as Estado;
      try {
        const result = service.changeStatus(ticket.id, next);
        if (result.ok) toast.success('Estado actualizado.');
        else toast.error('No se pudo actualizar el estado del ticket.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo guardar el cambio.');
      }
    },
  }, ...STATES.map((state) => h('option', { value: state.value }, state.label))) as HTMLSelectElement;
  select.value = ticket.estado;
  return select;
}

function ticketCard(ticket: Ticket, service: TicketService, toast: ToastController): HTMLElement {
  return h('article', { className: 'ticket-card' },
    h('div', { className: 'ticket-card-top' },
      h('span', { className: 'ticket-code' }, formatCodigo(ticket.codigo)),
      createBadge('estado', ticket.estado)),
    h('h2', { className: 'ticket-card-title' }, h('a', { className: 'ticket-title', href: `#/tickets/${encodeURIComponent(ticket.id)}` }, ticket.titulo)),
    h('p', { className: 'ticket-description' }, ticket.descripcion),
    h('div', { className: 'ticket-meta' },
      h('span', null, 'Categoría: ', h('strong', null, CATEGORIES.find((item) => item.value === ticket.categoria)?.label ?? ticket.categoria)),
      createBadge('prioridad', ticket.prioridad)),
    h('div', { className: 'quick-status-row' }, statusControl(ticket, service, toast)),
    h('time', { className: 'ticket-date', datetime: ticket.creadoEn }, `Creado ${formatDate(ticket.creadoEn)}`),
  );
}

function ticketTable(tickets: readonly Ticket[], service: TicketService, toast: ToastController): HTMLElement {
  const body = h('tbody');
  for (const ticket of tickets) {
    body.append(h('tr', null,
      h('td', { className: 'ticket-code' }, formatCodigo(ticket.codigo)),
      h('th', { scope: 'row' }, h('a', { className: 'ticket-title', href: `#/tickets/${encodeURIComponent(ticket.id)}` }, ticket.titulo)),
      h('td', null, CATEGORIES.find((item) => item.value === ticket.categoria)?.label ?? ticket.categoria),
      h('td', null, createBadge('prioridad', ticket.prioridad)),
      h('td', null, statusControl(ticket, service, toast)),
      h('td', null, h('time', { datetime: ticket.creadoEn }, formatDate(ticket.creadoEn))),
    ));
  }
  return h('div', { className: 'table-scroll' },
    h('table', { className: 'ticket-table' },
      h('caption', null, 'Tickets registrados'),
      h('thead', null, h('tr', null,
        h('th', { scope: 'col' }, 'Código'), h('th', { scope: 'col' }, 'Título'), h('th', { scope: 'col' }, 'Categoría'),
        h('th', { scope: 'col' }, 'Prioridad'), h('th', { scope: 'col' }, 'Estado'), h('th', { scope: 'col' }, 'Creación'))),
      body));
}

function listResults(tickets: readonly Ticket[], query: TicketQuery, service: TicketService, toast: ToastController, onClear: () => void): HTMLElement {
  if (tickets.length === 0) {
    const hasFilter = Boolean(query.texto || query.estado !== 'todos' || query.categoria !== 'todas' || query.prioridad !== 'todas');
    if (hasFilter) {
      return h('div', { className: 'empty-state empty-state--filtered', role: 'status' },
        h('h2', null, 'Sin resultados'),
        h('p', null, 'No hay tickets que coincidan con estos criterios.'),
        h('button', { type: 'button', className: 'button button--secondary', 'data-action': 'clear-filters', onClick: onClear }, 'Limpiar'));
    }
    return h('div', { className: 'empty-state', role: 'status' },
      h('span', { className: 'empty-mark', 'aria-hidden': 'true' }, '＋'),
      h('h2', null, 'Aún no hay tickets'),
      h('p', null, 'Registra la primera incidencia para empezar a organizar el soporte.'),
      h('a', { href: '#/tickets/nuevo', className: 'button' }, 'Registrar el primer ticket'));
  }
  const cards = h('div', { className: 'ticket-cards' }, ...tickets.map((ticket) => ticketCard(ticket, service, toast)));
  return h('div', { className: 'ticket-list' }, cards, ticketTable(tickets, service, toast));
}

export function createListView(options: { service: TicketService; navigate(path: string): void; toast: ToastController; queryStore: TicketQueryStore }): HTMLElement {
  const results = h('div', { className: 'list-results' });
  const resultCount = h('p', { className: 'result-count', 'aria-live': 'polite' });
  const clear = () => options.queryStore.reset();
  const updateResults = () => {
    const query = options.queryStore.getState();
    const tickets = options.service.query(query);
    resultCount.textContent = `${tickets.length} ${tickets.length === 1 ? 'resultado' : 'resultados'}`;
    results.replaceChildren(listResults(tickets, query, options.service, options.toast, clear));
  };
  const filterBar = createFilterBar(options.queryStore, updateResults);
  const section = h('section', { className: 'page-section' },
    h('div', { className: 'page-heading' },
      h('div', null, h('h1', null, 'Tus tickets'), h('p', { className: 'lead' }, 'Incidencias registradas y su estado actual.')),
      h('a', { href: '#/tickets/nuevo', className: 'button', onClick: (event: Event) => { event.preventDefault(); options.navigate('/tickets/nuevo'); } }, 'Nuevo ticket')),
    filterBar,
    resultCount,
    results,
  );
  results.addEventListener('click', (event) => {
    if ((event.target as Element).closest('[data-action="clear-filters"]')) clear();
  });
  updateResults();
  return section;
}

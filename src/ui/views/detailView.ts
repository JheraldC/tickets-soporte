import { CATEGORIES, STATES } from '../../domain/constants';
import type { TicketService } from '../../domain/ticketService';
import type { Estado } from '../../domain/types';
import { createBadge, formatCodigo } from '../components/badge';
import { formatDate, h } from '../dom';
import type { ToastController } from '../components/toast';
import { confirmDialog } from '../components/confirmDialog';

export function createDetailView(options: { service: TicketService; id: string; navigate(path: string): void; toast: ToastController }): HTMLElement {
  const ticket = options.service.get(options.id);
  if (!ticket) {
    return h('section', { className: 'page-section empty-detail' },
      h('h1', null, 'Ticket no encontrado'),
      h('p', null, 'El ticket solicitado no está disponible. Puede haberse eliminado.'),
      h('a', { href: '#/tickets', className: 'button', onClick: (event: Event) => { event.preventDefault(); options.navigate('/tickets'); } }, 'Volver al listado'));
  }

  const field = (label: string, value: Node | string) => h('div', { className: 'detail-field' }, h('dt', null, label), h('dd', null, value));
  const resolution = ticket.resueltoEn ? field('Resuelto', formatDate(ticket.resueltoEn)) : null;
  const statusId = `detail-status-${ticket.id}`;
  const statusSelect = h('select', {
    id: statusId,
    name: 'estado',
    'aria-label': 'Estado del ticket',
    onChange: (event: Event) => {
      const next = (event.currentTarget as HTMLSelectElement).value as Estado;
      try {
        const result = options.service.changeStatus(ticket.id, next);
        if (result.ok) options.toast.success('Estado actualizado.');
        else options.toast.error('No se pudo actualizar el estado del ticket.');
      } catch (error) {
        options.toast.error(error instanceof Error ? error.message : 'No se pudo guardar el cambio.');
      }
    },
  }, ...STATES.map((state) => h('option', { value: state.value }, state.label))) as HTMLSelectElement;
  statusSelect.value = ticket.estado;
  const deleteButton = h('button', {
    type: 'button',
    className: 'button button--danger',
    'data-action': 'delete',
    onClick: async () => {
      const accepted = await confirmDialog({
        title: 'Eliminar ticket',
        message: `¿Quieres eliminar el ticket ${formatCodigo(ticket.codigo)} “${ticket.titulo}”? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar ticket',
      });
      if (!accepted) return;
      try {
        const result = options.service.remove(ticket.id);
        if (!result.ok) {
          options.toast.error('El ticket ya no está disponible.');
          return;
        }
        options.toast.success('Ticket eliminado.');
        options.navigate('/tickets');
      } catch (error) {
        options.toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el ticket.');
      }
    },
  }, 'Eliminar');
  return h('section', { className: 'page-section detail-page' },
    h('a', { href: '#/tickets', className: 'back-link', onClick: (event: Event) => { event.preventDefault(); options.navigate('/tickets'); } }, '← Volver a tickets'),
    h('div', { className: 'page-heading detail-heading' },
      h('div', null,
        h('p', { className: 'ticket-code' }, formatCodigo(ticket.codigo)),
        h('h1', null, ticket.titulo),
        h('div', { className: 'badge-row' }, createBadge('estado', ticket.estado), createBadge('prioridad', ticket.prioridad))),
      h('div', { className: 'detail-actions' },
        h('a', { href: `#/tickets/${encodeURIComponent(ticket.id)}/editar`, className: 'button button--secondary' }, 'Editar'),
        deleteButton)),
    h('section', { className: 'detail-panel', 'aria-labelledby': 'description-heading' },
      h('h2', { id: 'description-heading' }, 'Descripción'),
      h('p', { className: 'detail-description' }, ticket.descripcion)),
    h('section', { className: 'detail-panel', 'aria-labelledby': 'data-heading' },
      h('h2', { id: 'data-heading' }, 'Información del ticket'),
      h('dl', { className: 'detail-grid' },
        field('Categoría', CATEGORIES.find((item) => item.value === ticket.categoria)?.label ?? ticket.categoria),
        field('Prioridad', createBadge('prioridad', ticket.prioridad)),
        field('Estado actual', createBadge('estado', ticket.estado)),
        field('Creado', formatDate(ticket.creadoEn)),
        field('Última modificación', formatDate(ticket.actualizadoEn)),
        resolution)),
    h('div', { className: 'detail-status' }, h('label', { htmlFor: statusId }, 'Cambiar estado'), statusSelect),
  );
}

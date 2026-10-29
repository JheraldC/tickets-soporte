import type { TicketService } from '../../domain/ticketService';
import type { TicketInput } from '../../domain/types';
import { createTicketForm } from '../components/ticketForm';
import { formatCodigo } from '../components/badge';
import { h } from '../dom';
import type { ToastController } from '../components/toast';

export function createFormView(options: {
  service: TicketService;
  toast: ToastController;
  navigate(path: string): void;
  id?: string;
}): HTMLElement {
  const existing = options.id ? options.service.get(options.id) : undefined;
  if (options.id && !existing) {
    return h('section', { className: 'page-section' },
      h('h1', null, 'Ticket no encontrado'),
      h('p', null, 'El ticket solicitado ya no está disponible.'),
      h('a', { href: '#/tickets', className: 'button', onClick: (event: Event) => { event.preventDefault(); options.navigate('/tickets'); } }, 'Volver al listado'));
  }

  const editing = Boolean(existing);
  const title = editing ? 'Editar ticket' : 'Nuevo ticket';
  const form = createTicketForm({
    initial: existing ? {
      titulo: existing.titulo,
      descripcion: existing.descripcion,
      categoria: existing.categoria,
      prioridad: existing.prioridad,
    } : undefined,
    submitLabel: editing ? 'Guardar cambios' : 'Guardar ticket',
    onCancel: () => options.navigate(editing ? `/tickets/${existing!.id}` : '/tickets'),
    onSubmit: (input: TicketInput) => {
      try {
        const result = editing
          ? options.service.update(existing!.id, input)
          : options.service.create(input);
        if (!result.ok) {
          options.toast.error(result.error === 'not-found' ? 'El ticket ya no está disponible.' : 'Revisa los datos del formulario.');
          return;
        }
        options.toast.success(editing
          ? `Ticket ${formatCodigo(result.value.codigo)} actualizado.`
          : `Ticket ${formatCodigo(result.value.codigo)} creado.`);
        options.navigate(editing ? `/tickets/${result.value.id}` : '/tickets');
      } catch (error) {
        options.toast.error(error instanceof Error ? error.message : 'No se pudo guardar el ticket.');
      }
    },
  });

  return h('section', { className: 'page-section form-page' },
    h('div', { className: 'page-heading' },
      h('div', null, h('h1', null, title), h('p', { className: 'lead' }, editing ? 'Actualiza los datos de la incidencia.' : 'Registra una incidencia para darle seguimiento.'))),
    form,
  );
}

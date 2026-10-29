import { CATEGORIES, DESCRIPCION_MAX, PRIORITIES, TITULO_MAX } from '../../domain/constants';
import { validateTicketInput } from '../../domain/validation';
import type { TicketInput, TicketInputValido, ValidationErrors } from '../../domain/types';
import { h } from '../dom';

export interface TicketFormOptions {
  initial?: Partial<TicketInput>;
  submitLabel?: string;
  onSubmit(value: TicketInputValido): void;
  onCancel?(): void;
  cancelLabel?: string;
}

export function createTicketForm(options: TicketFormOptions): HTMLFormElement {
  const initial = options.initial ?? {};
  let attempted = false;
  const fields = {
    titulo: h('input', { id: 'ticket-title', name: 'titulo', type: 'text', maxlength: TITULO_MAX, required: true, autocomplete: 'off', value: initial.titulo ?? '' }) as HTMLInputElement,
    descripcion: h('textarea', { id: 'ticket-description', name: 'descripcion', maxlength: DESCRIPCION_MAX, rows: 5, required: true }) as HTMLTextAreaElement,
    categoria: h('select', { id: 'ticket-category', name: 'categoria', required: true }) as HTMLSelectElement,
    prioridad: h('select', { id: 'ticket-priority', name: 'prioridad', required: true }) as HTMLSelectElement,
  };
  fields.descripcion.value = initial.descripcion ?? '';

  const errors = {
    titulo: h('span', { id: 'ticket-title-error', className: 'field-error', hidden: true }),
    descripcion: h('span', { id: 'ticket-description-error', className: 'field-error', hidden: true }),
    categoria: h('span', { id: 'ticket-category-error', className: 'field-error', hidden: true }),
    prioridad: h('span', { id: 'ticket-priority-error', className: 'field-error', hidden: true }),
  };
  for (const [name, field] of Object.entries(fields)) field.setAttribute('aria-describedby', errors[name as keyof typeof errors].id);

  fields.categoria.append(h('option', { value: '' }, 'Selecciona…'));
  for (const item of CATEGORIES) fields.categoria.append(h('option', { value: item.value }, item.label));
  fields.prioridad.append(h('option', { value: '' }, 'Selecciona…'));
  for (const item of PRIORITIES) fields.prioridad.append(h('option', { value: item.value }, item.label));
  fields.categoria.value = initial.categoria ?? '';
  fields.prioridad.value = initial.prioridad ?? '';

  const counter = h('span', { className: 'character-count', 'aria-live': 'polite' }, `${fields.descripcion.value.length} / ${DESCRIPCION_MAX}`);
  const form = h('form', { className: 'ticket-form', novalidate: true }) as HTMLFormElement;
  const fieldGroup = (label: string, field: HTMLElement, error: HTMLElement, extra?: HTMLElement) =>
    h('div', { className: `form-field${label === 'Descripción' ? ' form-field--wide' : ''}` },
      h('label', { htmlFor: field.id }, label),
      field,
      extra,
      error);
  const actions = h('div', { className: 'form-actions' },
    h('button', { type: 'submit', className: 'button' }, options.submitLabel ?? 'Guardar ticket'));
  if (options.onCancel) {
    actions.append(h('button', { type: 'button', className: 'button button--secondary', onClick: () => options.onCancel?.() }, options.cancelLabel ?? 'Cancelar'));
  }

  form.append(
    fieldGroup('Título', fields.titulo, errors.titulo),
    fieldGroup('Descripción', fields.descripcion, errors.descripcion, counter),
    h('div', { className: 'form-grid' },
      fieldGroup('Categoría', fields.categoria, errors.categoria),
      fieldGroup('Prioridad', fields.prioridad, errors.prioridad)),
    actions,
  );

  function values(): TicketInput {
    return {
      titulo: fields.titulo.value,
      descripcion: fields.descripcion.value,
      categoria: fields.categoria.value,
      prioridad: fields.prioridad.value,
    };
  }

  function showErrors(validationErrors: ValidationErrors, focusInvalid = false): void {
    let firstInvalid: HTMLElement | null = null;
    for (const name of Object.keys(fields) as (keyof typeof fields)[]) {
      const message = validationErrors[name];
      errors[name].textContent = message ?? '';
      errors[name].hidden = !message;
      fields[name].setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message && !firstInvalid) firstInvalid = fields[name];
    }
    if (focusInvalid) firstInvalid?.focus();
  }

  function validate(focusInvalid = false): TicketInputValido | null {
    const result = validateTicketInput(values());
    if (!result.ok) {
      showErrors(result.error, focusInvalid);
      return null;
    }
    showErrors({});
    return result.value;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    attempted = true;
    const valid = validate(true);
    if (valid) options.onSubmit(valid);
  });
  fields.descripcion.addEventListener('input', () => { counter.textContent = `${fields.descripcion.value.length} / ${DESCRIPCION_MAX}`; });
  for (const field of Object.values(fields)) {
    field.addEventListener('input', () => { if (attempted) validate(); });
    field.addEventListener('change', () => { if (attempted) validate(); });
  }
  return form;
}

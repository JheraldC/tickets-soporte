import { FILTER_CATEGORIES, FILTER_PRIORITIES, FILTER_STATES } from '../../domain/query';
import type { TicketQuery } from '../../domain/types';
import type { TicketQueryStore } from '../state';
import { h } from '../dom';

function options(items: readonly { value: string; label: string }[]): HTMLOptionElement[] {
  return items.map((item) => h('option', { value: item.value }, item.label) as HTMLOptionElement);
}

export function createFilterBar(store: TicketQueryStore, onChange: () => void): HTMLElement {
  const initial = store.getState();
  const search = h('input', {
    type: 'search',
    name: 'texto',
    id: 'ticket-search',
    placeholder: 'Título o descripción',
    value: initial.texto,
    autocomplete: 'off',
  }) as HTMLInputElement;
  const state = h('select', { name: 'estado', id: 'filter-state' }, ...options(FILTER_STATES)) as HTMLSelectElement;
  const category = h('select', { name: 'categoria', id: 'filter-category' }, ...options(FILTER_CATEGORIES)) as HTMLSelectElement;
  const priority = h('select', { name: 'prioridad', id: 'filter-priority' }, ...options(FILTER_PRIORITIES)) as HTMLSelectElement;
  state.value = initial.estado;
  category.value = initial.categoria;
  priority.value = initial.prioridad;
  const controls = h('div', { className: 'filter-controls' },
    h('div', { className: 'filter-control' }, h('label', { htmlFor: state.id }, 'Estado'), state),
    h('div', { className: 'filter-control' }, h('label', { htmlFor: category.id }, 'Categoría'), category),
    h('div', { className: 'filter-control' }, h('label', { htmlFor: priority.id }, 'Prioridad'), priority),
    h('button', { type: 'button', className: 'button button--secondary', 'data-action': 'clear-filters' }, 'Limpiar'),
  );
  const details = h('details', { className: 'filter-panel', open: true }, h('summary', null, 'Filtros'), controls);
  const wrapper = h('div', { className: 'filter-bar' },
    h('div', { className: 'filter-control search-control' }, h('label', { htmlFor: search.id }, 'Buscar tickets'), search),
    details);
  let timer: ReturnType<typeof setTimeout> | undefined;

  search.addEventListener('input', () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      store.setState({ texto: search.value });
      onChange();
    }, 150);
  });
  const update = (key: keyof TicketQuery, value: string) => {
    store.setState({ [key]: value } as Partial<TicketQuery>);
    onChange();
  };
  state.addEventListener('change', () => update('estado', state.value));
  category.addEventListener('change', () => update('categoria', category.value));
  priority.addEventListener('change', () => update('prioridad', priority.value));
  controls.querySelector<HTMLButtonElement>('[data-action="clear-filters"]')!.addEventListener('click', () => {
    if (timer) clearTimeout(timer);
    search.value = '';
    state.value = 'todos';
    category.value = 'todas';
    priority.value = 'todas';
    store.reset();
    onChange();
  });
  return wrapper;
}

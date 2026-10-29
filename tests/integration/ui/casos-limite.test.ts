import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { makeTicket } from '../../helpers';
import { mountForTest, setField, submitForm } from '../../ui-test-utils';

beforeEach(() => { document.body.replaceChildren(); });
afterEach(() => { vi.useRealTimers(); });

describe('casos límite', () => {
  it('rechaza título y descripción de solo espacios', () => {
    window.location.hash = '#/tickets/nuevo';
    const service = createTicketService({ repository: createMemoryRepository() });
    const { root, unmount } = mountForTest(service);
    setField('titulo', '     ', root);
    setField('descripcion', '          ', root);
    setField('categoria', 'hardware', root);
    setField('prioridad', 'media', root);
    submitForm(root);
    expect(root.textContent).toContain('El título es obligatorio.');
    expect(root.textContent).toContain('La descripción es obligatoria.');
    expect(service.list()).toHaveLength(0);
    unmount();
  });

  it('recorta espacios de búsqueda y conserva símbolos, tildes y eñes', () => {
    vi.useFakeTimers();
    const ticket = makeTicket({ titulo: 'Configuración ñ #2', descripcion: 'Atención: señal débil.' });
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });
    window.location.hash = '#/tickets';
    const { root, unmount } = mountForTest(service);
    const search = root.querySelector<HTMLInputElement>('[name="texto"]')!;
    search.value = '  CONFIGURACION Ñ  ';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(150);
    expect(root.querySelectorAll('.ticket-card')).toHaveLength(1);
    search.value = '  #2  ';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(150);
    expect(root.querySelectorAll('.ticket-card')).toHaveLength(1);
    expect(service.get(ticket.id)?.titulo).toBe('Configuración ñ #2');
    expect(service.get(ticket.id)?.descripcion).toBe('Atención: señal débil.');
    unmount();
  });
});

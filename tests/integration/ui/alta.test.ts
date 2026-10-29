import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { mountForTest, setField, submitForm } from '../../ui-test-utils';

const fixedService = () => createTicketService({
  repository: createMemoryRepository(),
  clock: { now: () => new Date('2026-10-29T12:00:00.000Z') },
  ids: { next: () => '33333333-3333-4333-8333-333333333333' },
});

beforeEach(() => { document.body.replaceChildren(); window.location.hash = '#/tickets/nuevo'; });

describe('alta de tickets', () => {
  it('guarda un ticket válido y confirma en el listado', () => {
    const service = fixedService();
    const { root, unmount } = mountForTest(service);
    setField('titulo', 'Impresora no imprime', root);
    setField('descripcion', 'La impresora muestra error al iniciar.', root);
    setField('categoria', 'hardware', root);
    setField('prioridad', 'alta', root);
    submitForm(root);
    expect(window.location.hash).toBe('#/tickets');
    expect(root.textContent).toContain('TK-0001');
    expect(root.textContent).toContain('Impresora no imprime');
    expect(root.textContent).toContain('Pendiente');
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Ticket TK-0001 creado.');
    unmount();
  });

  it('asocia cuatro errores, conserva los valores, enfoca el primero y actualiza el contador', () => {
    const { root, unmount } = mountForTest(fixedService());
    setField('titulo', 'abc', root);
    setField('descripcion', '', root);
    setField('categoria', '', root);
    setField('prioridad', '', root);
    submitForm(root);
    expect(root.querySelectorAll('.field-error:not([hidden])')).toHaveLength(4);
    for (const name of ['titulo', 'descripcion', 'categoria', 'prioridad']) {
      const field = root.querySelector<HTMLElement>(`[name="${name}"]`)!;
      const describedBy = field.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(root.querySelector(`#${describedBy}`)?.textContent).not.toBe('');
    }
    expect(root.querySelector<HTMLInputElement>('[name="titulo"]')?.value).toBe('abc');
    expect(document.activeElement).toBe(root.querySelector('[name="titulo"]'));
    setField('descripcion', 'La impresora se detiene.', root);
    expect(root.querySelector('.character-count')?.textContent).toContain(String('La impresora se detiene.'.length));
    setField('titulo', 'Impresora sin red', root);
    setField('categoria', 'hardware', root);
    setField('prioridad', 'media', root);
    expect(root.querySelectorAll('.field-error:not([hidden])')).toHaveLength(0);
    unmount();
  });
});

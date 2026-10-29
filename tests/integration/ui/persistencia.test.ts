import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocalStorageRepository } from '../../../src/storage/localStorageRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { STORAGE_KEY } from '../../../src/domain/constants';
import { mountForTest, setField, submitForm } from '../../ui-test-utils';

class BackupFailureStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void {
    if (key.startsWith(`${STORAGE_KEY}:backup-`)) throw new DOMException('full', 'QuotaExceededError');
    this.values.set(key, String(value));
  }
}

beforeEach(() => {
  window.localStorage.clear();
  document.body.replaceChildren();
  window.location.hash = '#/tickets';
});

afterEach(() => vi.restoreAllMocks());

describe('persistencia local', () => {
  it('restaura tickets al desmontar y volver a montar sobre el mismo Storage', () => {
    const repository = createLocalStorageRepository(window.localStorage);
    const service = createTicketService({ repository, ids: { next: (() => { let id = 0; return () => `00000000-0000-4000-8000-${String(++id).padStart(12, '0')}`; })() } });
    for (let index = 0; index < 3; index += 1) {
      service.create({ titulo: `Ticket número ${index + 1}`, descripcion: `Descripción para el ticket número ${index + 1}.`, categoria: 'software', prioridad: 'media' });
    }
    const first = mountForTest(service);
    expect(first.root.querySelectorAll('.ticket-card')).toHaveLength(3);
    first.unmount();
    const restored = createTicketService({ repository: createLocalStorageRepository(window.localStorage) });
    const second = mountForTest(restored);
    expect(second.root.querySelectorAll('.ticket-card')).toHaveLength(3);
    expect(second.root.textContent).toContain('Ticket número 1');
    second.unmount();
  });

  it('abre con aviso ante datos dañados y deja registrar nuevos tickets', () => {
    window.localStorage.setItem(STORAGE_KEY, '{roto');
    const service = createTicketService({ repository: createLocalStorageRepository(window.localStorage) });
    window.location.hash = '#/tickets';
    const { root, unmount } = mountForTest(service);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('No se pudieron leer');
    expect([...Array(window.localStorage.length)].some((_, index) => window.localStorage.key(index)?.startsWith(`${STORAGE_KEY}:backup-`))).toBe(true);
    root.querySelector<HTMLAnchorElement>('a[href="#/tickets/nuevo"]')?.click();
    setField('titulo', 'Nuevo ticket', root);
    setField('descripcion', 'Se creó después del dato dañado.', root);
    setField('categoria', 'otro', root);
    setField('prioridad', 'baja', root);
    submitForm(root);
    expect(service.list()).toHaveLength(1);
    unmount();
  });

  it('avisa y no muestra como guardado el ticket cuando falla setItem', () => {
    const storage: Storage = {
      get length() { return 0; },
      clear() {},
      getItem() { return null; },
      key() { return null; },
      removeItem() {},
      setItem() { throw new DOMException('full', 'QuotaExceededError'); },
    };
    const service = createTicketService({ repository: createLocalStorageRepository(storage) });
    window.location.hash = '#/tickets/nuevo';
    const { root, unmount } = mountForTest(service);
    setField('titulo', 'Ticket sin espacio', root);
    setField('descripcion', 'El navegador no tiene espacio libre.', root);
    setField('categoria', 'hardware', root);
    setField('prioridad', 'alta', root);
    submitForm(root);
    expect(service.list()).toHaveLength(0);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('No se pudo guardar');
    unmount();
  });

  it('no sobrescribe los datos dañados si falla el respaldo y luego se intenta crear', () => {
    const original = '{roto';
    const storage = new BackupFailureStorage();
    storage.setItem(STORAGE_KEY, original);
    const service = createTicketService({ repository: createLocalStorageRepository(storage) });
    const { root, unmount } = mountForTest(service);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('no se pudo crear');
    root.querySelector<HTMLAnchorElement>('.page-heading a[href="#/tickets/nuevo"]')?.click();
    setField('titulo', 'Ticket sin respaldo', root);
    setField('descripcion', 'La copia no pudo escribirse.', root);
    setField('categoria', 'otro', root);
    setField('prioridad', 'baja', root);
    submitForm(root);

    expect(service.list()).toHaveLength(0);
    expect(storage.getItem(STORAGE_KEY)).toBe(original);
    expect([...Array(storage.length)].some((_, index) => storage.key(index)?.startsWith(`${STORAGE_KEY}:backup-`))).toBe(false);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('No se guardó');
    unmount();
  });
});

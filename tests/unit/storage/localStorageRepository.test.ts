import { describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '../../../src/domain/constants';
import { StorageError } from '../../../src/domain/ports';
import { createLocalStorageRepository } from '../../../src/storage/localStorageRepository';
import { makeTicket } from '../../helpers';

class TestStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

describe('createLocalStorageRepository', () => {
  it('devuelve colección vacía sin aviso si la clave no existe', () => {
    expect(createLocalStorageRepository(new TestStorage()).load()).toEqual({ tickets: [] });
  });

  it('guarda y carga el formato versionado', () => {
    const storage = new TestStorage();
    const repository = createLocalStorageRepository(storage);
    repository.saveAll([makeTicket()]);
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual({ version: 1, tickets: [makeTicket()] });
    expect(repository.load()).toEqual({ tickets: [makeTicket()] });
  });

  it('respalda JSON inválido, inicia vacío y advierte corrupción', () => {
    const storage = new TestStorage();
    storage.setItem(STORAGE_KEY, '{roto');
    const result = createLocalStorageRepository(storage).load();
    expect(result.tickets).toEqual([]);
    expect(result.warning).toMatchObject({ kind: 'corrupted' });
    const backupKey = [...Array(storage.length)].map((_, i) => storage.key(i)!).find((key) => key.startsWith(`${STORAGE_KEY}:backup-`));
    expect(backupKey).toBeDefined();
    expect(storage.getItem(backupKey!)).toBe('{roto');
  });

  it('trata versión incompatible o colección no válida como datos corruptos', () => {
    for (const value of [{ version: 2, tickets: [] }, { version: 1, tickets: {} }]) {
      const storage = new TestStorage();
      storage.setItem(STORAGE_KEY, JSON.stringify(value));
      expect(createLocalStorageRepository(storage).load().warning).toMatchObject({ kind: 'corrupted' });
    }
  });

  it('conserva tickets válidos, respalda el original y avisa los inválidos descartados', () => {
    const storage = new TestStorage();
    const original = JSON.stringify({ version: 1, tickets: [makeTicket(), { titulo: 'roto' }] });
    storage.setItem(STORAGE_KEY, original);
    const result = createLocalStorageRepository(storage).load();
    expect(result.tickets).toEqual([makeTicket()]);
    expect(result.warning).toMatchObject({ kind: 'partial', message: expect.stringContaining('1') });
    const backupKey = [...Array(storage.length)].map((_, i) => storage.key(i)!).find((key) => key.startsWith(`${STORAGE_KEY}:backup-`));
    expect(storage.getItem(backupKey!)).toBe(original);
  });

  it('convierte fallos al escribir en StorageError write-failed', () => {
    const storage = new TestStorage();
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    expect(() => createLocalStorageRepository(storage).saveAll([makeTicket()])).toThrowError(
      expect.objectContaining({ kind: 'write-failed' }),
    );
  });

  it('informa cuando Storage lanza al acceder a sus métodos', () => {
    const inaccessible = new Proxy({} as Storage, { get: () => { throw new Error('blocked'); } });
    expect(createLocalStorageRepository(inaccessible).load()).toMatchObject({
      tickets: [],
      warning: { kind: 'unavailable' },
    });
  });

  it('respalda de forma defensiva cuando guardar la copia también falla', () => {
    const storage = new TestStorage();
    storage.setItem(STORAGE_KEY, '{roto');
    vi.spyOn(storage, 'setItem').mockImplementationOnce(() => { throw new Error('blocked backup'); });
    expect(createLocalStorageRepository(storage).load().warning).toMatchObject({ kind: 'corrupted' });
  });

  it('expone StorageError como error tipado', () => {
    expect(new StorageError('write-failed')).toBeInstanceOf(Error);
  });
});

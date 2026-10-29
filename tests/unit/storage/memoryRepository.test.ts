import { describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { makeTicket } from '../../helpers';

describe('createMemoryRepository', () => {
  it('carga inicialmente una colección vacía o la colección entregada', () => {
    expect(createMemoryRepository().load().tickets).toEqual([]);
    expect(createMemoryRepository([makeTicket()]).load().tickets).toEqual([makeTicket()]);
  });

  it('saveAll reemplaza la colección', () => {
    const repository = createMemoryRepository([makeTicket()]);
    repository.saveAll([makeTicket({ id: '22222222-2222-4222-8222-222222222222' })]);
    expect(repository.load().tickets).toEqual([
      makeTicket({ id: '22222222-2222-4222-8222-222222222222' }),
    ]);
  });

  it('aísla las copias tanto al cargar como al guardar', () => {
    const initial = [makeTicket()];
    const repository = createMemoryRepository(initial);
    initial[0]!.titulo = 'cambiado externamente';
    const loaded = repository.load().tickets;
    loaded[0]!.titulo = 'cambiado al leer';
    expect(repository.load().tickets[0]!.titulo).toBe('Impresora no imprime');
    repository.saveAll(loaded);
    loaded[0]!.titulo = 'cambiado tras guardar';
    expect(repository.load().tickets[0]!.titulo).toBe('cambiado al leer');
  });
});

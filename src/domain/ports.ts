import type { Ticket } from './types';

export type StorageErrorKind = 'corrupted' | 'partial' | 'write-failed' | 'unavailable';

export class StorageError extends Error {
  readonly name = 'StorageError';

  constructor(public readonly kind: StorageErrorKind, message?: string) {
    super(message ?? defaultMessage(kind));
  }
}

function defaultMessage(kind: StorageErrorKind): string {
  switch (kind) {
    case 'corrupted': return 'No se pudieron leer los tickets guardados; se creó una copia de respaldo.';
    case 'partial': return 'Algunos tickets no se pudieron leer; se conservaron los datos válidos.';
    case 'write-failed': return 'No se pudo guardar el cambio. Comprueba el espacio disponible e inténtalo otra vez.';
    case 'unavailable': return 'El almacenamiento local no está disponible en este navegador.';
  }
}

export interface TicketRepository {
  load(): { tickets: Ticket[]; warning?: StorageError };
  saveAll(tickets: readonly Ticket[]): void;
}

export interface Clock { now(): Date }
export interface IdGenerator { next(): string }

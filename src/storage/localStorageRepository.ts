import { STORAGE_KEY } from '../domain/constants';
import { StorageError, type TicketRepository } from '../domain/ports';
import type { Ticket } from '../domain/types';
import { isValidTicket } from '../domain/validation';

export function createLocalStorageRepository(storage?: Storage, key = STORAGE_KEY): TicketRepository {
  let providedStorage = storage;

  function resolveStorage(): Storage {
    try {
      if (providedStorage) return providedStorage;
      if (typeof window === 'undefined') throw new Error('window is not available');
      providedStorage = window.localStorage;
      return providedStorage;
    } catch {
      throw new StorageError('unavailable');
    }
  }

  function backup(raw: string, backend: Storage): void {
    try {
      backend.setItem(`${key}:backup-${new Date().toISOString()}`, raw);
    } catch {
      // The read warning remains useful even when the backup cannot be written.
    }
  }

  function corrupt(raw: string, backend: Storage): { tickets: Ticket[]; warning: StorageError } {
    backup(raw, backend);
    return { tickets: [], warning: new StorageError('corrupted') };
  }

  return {
    load() {
      let backend: Storage;
      let raw: string | null;
      try {
        backend = resolveStorage();
        raw = backend.getItem(key);
      } catch (error) {
        const warning = error instanceof StorageError ? error : new StorageError('unavailable');
        return { tickets: [], warning };
      }
      if (raw === null) return { tickets: [] };

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw) as unknown;
      } catch {
        return corrupt(raw, backend);
      }
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return corrupt(raw, backend);
      const record = parsed as Record<string, unknown>;
      if (record.version !== 1 || !Array.isArray(record.tickets)) return corrupt(raw, backend);

      const tickets = record.tickets.filter(isValidTicket);
      const discarded = record.tickets.length - tickets.length;
      if (discarded > 0) {
        backup(raw, backend);
        return {
          tickets,
          warning: new StorageError('partial', `Se descartaron ${discarded} ticket(s) inválido(s); el resto sigue disponible.`),
        };
      }
      return { tickets };
    },

    saveAll(tickets) {
      try {
        resolveStorage().setItem(key, JSON.stringify({ version: 1, tickets }));
      } catch {
        throw new StorageError('write-failed');
      }
    },
  };
}

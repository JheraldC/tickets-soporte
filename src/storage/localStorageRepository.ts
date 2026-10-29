import { STORAGE_KEY } from '../domain/constants';
import { StorageError, type TicketRepository } from '../domain/ports';
import type { Ticket } from '../domain/types';
import { isValidTicket } from '../domain/validation';

export function createLocalStorageRepository(storage?: Storage, key = STORAGE_KEY): TicketRepository {
  let providedStorage = storage;
  let pendingBackup: string | undefined;

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

  function backup(raw: string, backend: Storage): boolean {
    try {
      backend.setItem(`${key}:backup-${new Date().toISOString()}`, raw);
      return true;
    } catch {
      return false;
    }
  }

  function corrupt(raw: string, backend: Storage): { tickets: Ticket[]; warning: StorageError } {
    const backedUp = backup(raw, backend);
    pendingBackup = backedUp ? undefined : raw;
    const warning = backedUp
      ? new StorageError('corrupted')
      : new StorageError('corrupted', 'No se pudieron leer los tickets y no se pudo crear el respaldo; el valor original se conserva. Libera espacio para guardar cambios.');
    return { tickets: [], warning };
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
        const backedUp = backup(raw, backend);
        pendingBackup = backedUp ? undefined : raw;
        return {
          tickets,
          warning: new StorageError(
            'partial',
            backedUp
              ? `Se descartaron ${discarded} ticket(s) inválido(s); el resto sigue disponible.`
              : `Se descartaron ${discarded} ticket(s) inválido(s), no se pudo crear el respaldo y el valor original se conserva. Libera espacio para guardar cambios.`,
          ),
        };
      }
      return { tickets };
    },

    saveAll(tickets) {
      try {
        const backend = resolveStorage();
        if (pendingBackup !== undefined) {
          if (!backup(pendingBackup, backend)) {
            throw new StorageError('write-failed', 'No se guardó el cambio porque no se pudo respaldar el contenido original; los datos dañados se conservaron. Libera espacio e inténtalo de nuevo.');
          }
          pendingBackup = undefined;
        }
        backend.setItem(key, JSON.stringify({ version: 1, tickets }));
      } catch (error) {
        if (error instanceof StorageError && error.kind === 'write-failed') throw error;
        throw new StorageError('write-failed');
      }
    },
  };
}

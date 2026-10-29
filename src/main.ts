import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import { StorageError, type TicketRepository } from './domain/ports';
import { createTicketService } from './domain/ticketService';
import { createLocalStorageRepository } from './storage/localStorageRepository';
import { createMemoryRepository } from './storage/memoryRepository';
import { mountApp } from './ui/app';

const root = document.getElementById('app');
if (!root) throw new Error('No se encontró el contenedor principal de la aplicación.');

let repository: TicketRepository;
try {
  const storage = window.localStorage;
  const probeKey = `tickets-soporte:probe:${window.crypto.randomUUID()}`;
  storage.setItem(probeKey, '1');
  storage.removeItem(probeKey);
  repository = createLocalStorageRepository(storage);
} catch {
  const memoryRepository = createMemoryRepository();
  repository = {
    load: () => ({ tickets: [], warning: new StorageError('unavailable') }),
    saveAll: (tickets) => memoryRepository.saveAll(tickets),
  };
}

const service = createTicketService({
  repository,
  clock: { now: () => new Date() },
  ids: { next: () => window.crypto.randomUUID() },
});

mountApp(root, service);

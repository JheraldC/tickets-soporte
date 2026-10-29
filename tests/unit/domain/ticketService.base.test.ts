import { describe, expect, it, vi } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { StorageError } from '../../../src/domain/ports';
import { makeTicket } from '../../helpers';

describe('ticketService base', () => {
  it('ordena list por creadoEn descendente y get devuelve undefined si falta', () => {
    const older = makeTicket({ id: '11111111-1111-4111-8111-111111111111' });
    const newer = makeTicket({ id: '22222222-2222-4222-8222-222222222222', creadoEn: '2026-10-30T10:00:00.000Z' });
    const service = createTicketService({ repository: createMemoryRepository([older, newer]) });
    expect(service.list().map((ticket) => ticket.id)).toEqual([newer.id, older.id]);
    expect(service.get('missing')).toBeUndefined();
  });

  it('notifica a suscriptores tras una mutación y permite dejar de notificar', () => {
    const service = createTicketService({ repository: createMemoryRepository() });
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    service.create({ titulo: 'Falla de red', descripcion: 'No responde el router del piso.', categoria: 'red', prioridad: 'alta' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]![0]).toHaveLength(1);
    unsubscribe();
    service.create({ titulo: 'Error de correo', descripcion: 'No se reciben mensajes nuevos.', categoria: 'software', prioridad: 'media' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('conserva el aviso inicial de lectura del repositorio para la UI', () => {
    const repository = {
      load: () => ({ tickets: [], warning: new StorageError('partial', 'Se descartó un ticket.') }),
      saveAll: vi.fn(),
    };
    const service = createTicketService({ repository });
    expect(service.getLoadWarning()).toMatchObject({ kind: 'partial', message: 'Se descartó un ticket.' });
  });
});

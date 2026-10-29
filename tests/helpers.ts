import type { Ticket } from '../src/domain/types';

export function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    codigo: 1,
    titulo: 'Impresora no imprime',
    descripcion: 'La impresora muestra un error al iniciar.',
    categoria: 'hardware',
    prioridad: 'media',
    estado: 'pendiente',
    creadoEn: '2026-10-29T10:00:00.000Z',
    actualizadoEn: '2026-10-29T10:00:00.000Z',
    resueltoEn: null,
    ...overrides,
  };
}

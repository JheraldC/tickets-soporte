import { describe, expect, it } from 'vitest';
import { filterTickets, normalizeText } from '../../../src/domain/query';
import type { TicketQuery } from '../../../src/domain/types';
import { makeTicket } from '../../helpers';

const all: TicketQuery = { texto: '', estado: 'todos', categoria: 'todas', prioridad: 'todas' };

describe('búsqueda y filtros', () => {
  it('normaliza tildes, mayúsculas y espacios extremos', () => {
    expect(normalizeText('  CONFIGURACIÓN del   correo  ')).toBe('configuracion del   correo');
  });

  it('busca subcadenas en título y descripción, sin distinguir tildes ni mayúsculas', () => {
    const printer = makeTicket({ titulo: 'Impresora de red', descripcion: 'Falla al imprimir.' });
    const mail = makeTicket({ id: '22222222-2222-4222-8222-222222222222', titulo: 'Correo', descripcion: 'Error de configuración del correo.' });
    expect(filterTickets([printer, mail], { ...all, texto: 'IMPRESORA' })).toEqual([printer]);
    expect(filterTickets([printer, mail], { ...all, texto: 'configuracion' })).toEqual([mail]);
  });

  it('filtra estado, categoría y prioridad con todos/todas y combina criterios con Y lógico', () => {
    const tickets = [
      makeTicket({ id: '11111111-1111-4111-8111-111111111111', creadoEn: '2026-10-29T09:00:00.000Z' }),
      makeTicket({ id: '22222222-2222-4222-8222-222222222222', categoria: 'software', prioridad: 'alta', estado: 'en_proceso', creadoEn: '2026-10-29T10:00:00.000Z' }),
      makeTicket({ id: '33333333-3333-4333-8333-333333333333', categoria: 'hardware', prioridad: 'alta', estado: 'resuelto', resueltoEn: '2026-10-29T11:00:00.000Z', actualizadoEn: '2026-10-29T11:00:00.000Z', creadoEn: '2026-10-29T08:00:00.000Z' }),
    ];
    expect(filterTickets(tickets, { ...all, estado: 'en_proceso' }).map((t) => t.id)).toEqual([tickets[1]!.id]);
    expect(filterTickets(tickets, { ...all, categoria: 'software' }).map((t) => t.id)).toEqual([tickets[1]!.id]);
    expect(filterTickets(tickets, { ...all, prioridad: 'alta' }).map((t) => t.id)).toEqual([tickets[1]!.id, tickets[2]!.id]);
    expect(filterTickets(tickets, { texto: 'impresora', estado: 'en_proceso', categoria: 'hardware', prioridad: 'alta' })).toEqual([]);
    expect(filterTickets(tickets, all).map((t) => t.id)).toEqual([tickets[1]!.id, tickets[0]!.id, tickets[2]!.id]);
  });

  it('procesa 500 tickets en menos de un segundo', () => {
    const tickets = Array.from({ length: 500 }, (_, index) => makeTicket({
      id: `${String(index).padStart(8, '0')}-1111-4111-8111-111111111111`,
      codigo: index + 1,
      titulo: `Incidencia ${index} de impresora`,
    }));
    const started = performance.now();
    const result = filterTickets(tickets, { ...all, texto: 'IMPRESORA' });
    expect(result).toHaveLength(500);
    expect(performance.now() - started).toBeLessThan(1000);
  });
});

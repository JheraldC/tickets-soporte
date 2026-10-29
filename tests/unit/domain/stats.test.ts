import { describe, expect, it } from 'vitest';
import { computeStats } from '../../../src/domain/stats';
import { makeTicket } from '../../helpers';

describe('computeStats', () => {
  it('devuelve ceros para todos los grupos cuando no hay tickets', () => {
    expect(computeStats([])).toEqual({
      total: 0,
      porEstado: {
        pendiente: { cantidad: 0, porcentaje: 0 },
        en_proceso: { cantidad: 0, porcentaje: 0 },
        resuelto: { cantidad: 0, porcentaje: 0 },
      },
      porCategoria: { hardware: 0, software: 0, red: 0, cuentas: 0, otro: 0 },
      porPrioridad: { baja: 0, media: 0, alta: 0, critica: 0 },
    });
  });

  it('cuenta estados, categorías y prioridades e incluye todos los porcentajes redondeados a un decimal', () => {
    const tickets = [
      makeTicket({ id: '11111111-1111-4111-8111-111111111111', estado: 'pendiente', categoria: 'hardware', prioridad: 'alta' }),
      makeTicket({ id: '22222222-2222-4222-8222-222222222222', estado: 'en_proceso', categoria: 'red', prioridad: 'baja' }),
      makeTicket({ id: '33333333-3333-4333-8333-333333333333', estado: 'resuelto', resueltoEn: '2026-10-29T11:00:00.000Z', categoria: 'red', prioridad: 'critica' }),
    ];
    const stats = computeStats(tickets);
    expect(stats.total).toBe(3);
    expect(stats.porEstado).toEqual({
      pendiente: { cantidad: 1, porcentaje: 33.3 },
      en_proceso: { cantidad: 1, porcentaje: 33.3 },
      resuelto: { cantidad: 1, porcentaje: 33.3 },
    });
    expect(stats.porCategoria).toEqual({ hardware: 1, software: 0, red: 2, cuentas: 0, otro: 0 });
    expect(stats.porPrioridad).toEqual({ baja: 1, media: 0, alta: 1, critica: 1 });
    expect(Object.values(stats.porEstado).reduce((sum, item) => sum + item.porcentaje, 0)).toBeCloseTo(100, 0);
  });
});

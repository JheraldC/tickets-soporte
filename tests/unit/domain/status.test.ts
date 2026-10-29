import { describe, expect, it } from 'vitest';
import { applyStatusChange } from '../../../src/domain/status';
import type { Estado } from '../../../src/domain/types';
import { makeTicket } from '../../helpers';

const now = new Date('2026-10-29T13:00:00.000Z');

describe('applyStatusChange', () => {
  it('permite cualquier transición entre estados distintos y actualiza la fecha', () => {
    const states: Estado[] = ['pendiente', 'en_proceso', 'resuelto'];
    for (const from of states) for (const to of states) {
      if (from === to) continue;
      const current = makeTicket({ estado: from, resueltoEn: from === 'resuelto' ? now.toISOString() : null });
      const changed = applyStatusChange(current, to, now);
      expect(changed.estado).toBe(to);
      expect(changed.actualizadoEn).toBe(now.toISOString());
      expect(changed.resueltoEn !== null).toBe(to === 'resuelto');
    }
  });

  it('al entrar en resuelto fija resueltoEn y al salir lo limpia', () => {
    expect(applyStatusChange(makeTicket(), 'resuelto', now).resueltoEn).toBe(now.toISOString());
    const resolved = makeTicket({ estado: 'resuelto', resueltoEn: '2026-10-29T11:00:00.000Z' });
    expect(applyStatusChange(resolved, 'pendiente', now).resueltoEn).toBeNull();
  });

  it('si el estado no cambia devuelve el ticket sin tocar sus fechas', () => {
    const ticket = makeTicket();
    expect(applyStatusChange(ticket, 'pendiente', now)).toEqual(ticket);
  });
});

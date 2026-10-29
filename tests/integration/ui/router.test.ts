import { describe, expect, it, vi } from 'vitest';
import { createRouter } from '../../../src/ui/router';

describe('router por hash', () => {
  it('resuelve rutas estáticas y parámetros dinámicos', () => {
    const handler = vi.fn();
    const router = createRouter({
      '/tickets': handler,
      '/tickets/nuevo': handler,
      '/tickets/:id': handler,
      '/tickets/:id/editar': handler,
      '/estadisticas': handler,
    }, vi.fn());
    expect(router.resolve('/tickets')?.params).toEqual({});
    expect(router.resolve('/tickets/nuevo')?.params).toEqual({});
    expect(router.resolve('/tickets/abc')?.params).toEqual({ id: 'abc' });
    expect(router.resolve('/tickets/abc/editar')?.params).toEqual({ id: 'abc' });
    expect(router.resolve('/estadisticas')?.params).toEqual({});
  });

  it('ejecuta la ruta actual y permite que la aplicación redirija rutas desconocidas', () => {
    window.location.hash = '#/tickets/no-existe/ruta';
    const onNotFound = vi.fn(() => { window.location.hash = '#/tickets'; });
    const tickets = vi.fn();
    const router = createRouter({ '/tickets': tickets }, onNotFound);
    router.start();
    expect(onNotFound).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#/tickets');
    expect(tickets).toHaveBeenCalledTimes(1);
    router.stop();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createToast } from '../../../src/ui/components/toast';

describe('notificaciones', () => {
  afterEach(() => vi.useRealTimers());

  it('oculta el mensaje de éxito después de cuatro segundos', () => {
    vi.useFakeTimers();
    const toast = createToast();
    toast.success('Ticket creado.');

    expect(toast.element.querySelector<HTMLElement>('[role="status"]')?.hidden).toBe(false);
    vi.advanceTimersByTime(3999);
    expect(toast.element.querySelector<HTMLElement>('[role="status"]')?.hidden).toBe(false);
    vi.advanceTimersByTime(1);
    expect(toast.element.querySelector<HTMLElement>('[role="status"]')?.hidden).toBe(true);
    expect(toast.element.querySelector('[role="status"]')?.textContent).toBe('');
    toast.dispose();
  });

  it('reemplaza el aviso anterior y limpia el temporizador al mostrar un error', () => {
    vi.useFakeTimers();
    const toast = createToast();
    toast.success('Primero');
    vi.advanceTimersByTime(2000);
    toast.success('Segundo');
    vi.advanceTimersByTime(2000);
    expect(toast.element.querySelector('[role="status"]')?.textContent).toBe('Segundo');
    toast.error('No se pudo guardar.');
    vi.advanceTimersByTime(5000);
    expect(toast.element.querySelector('[role="alert"]')?.textContent).toBe('No se pudo guardar.');
    toast.dispose();
  });
});

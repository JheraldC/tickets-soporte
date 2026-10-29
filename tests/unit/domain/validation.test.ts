import { describe, expect, it } from 'vitest';
import { isValidTicket, validateTicketInput } from '../../../src/domain/validation';
import type { TicketInput } from '../../../src/domain/types';
import { makeTicket } from '../../helpers';

const validInput: TicketInput = {
  titulo: '  Impresora no imprime  ',
  descripcion: '  La impresora muestra un error al iniciar.  ',
  categoria: 'hardware',
  prioridad: 'alta',
};

describe('validateTicketInput', () => {
  it('recorta los extremos y acepta títulos de 5 y 100 caracteres', () => {
    expect(validateTicketInput({ ...validInput, titulo: '  abcde  ' }).ok).toBe(true);
    expect(validateTicketInput({ ...validInput, titulo: ` ${'t'.repeat(100)} ` }).ok).toBe(true);
  });

  it('rechaza títulos demasiado cortos, largos o vacíos con el mensaje exacto', () => {
    for (const titulo of ['abcd', 't'.repeat(101)]) {
      const result = validateTicketInput({ ...validInput, titulo });
      expect(result).toMatchObject({ ok: false, error: { titulo: 'El título debe tener entre 5 y 100 caracteres.' } });
    }
    for (const titulo of ['', '   ']) expect(validateTicketInput({ ...validInput, titulo })).toMatchObject({
      ok: false,
      error: { titulo: 'El título es obligatorio.' },
    });
  });

  it('recorta y acepta descripciones de 10 y 1000 caracteres', () => {
    expect(validateTicketInput({ ...validInput, descripcion: ` ${'d'.repeat(10)} ` }).ok).toBe(true);
    expect(validateTicketInput({ ...validInput, descripcion: 'd'.repeat(1000) }).ok).toBe(true);
  });

  it('rechaza descripciones demasiado cortas, largas o vacías con el mensaje exacto', () => {
    for (const descripcion of ['d'.repeat(9), 'd'.repeat(1001)]) {
      expect(validateTicketInput({ ...validInput, descripcion })).toMatchObject({
        ok: false,
        error: { descripcion: 'La descripción debe tener entre 10 y 1000 caracteres.' },
      });
    }
    for (const descripcion of ['', '   ']) expect(validateTicketInput({ ...validInput, descripcion })).toMatchObject({
      ok: false,
      error: { descripcion: 'La descripción es obligatoria.' },
    });
  });

  it('acepta todas las categorías y prioridades declaradas', () => {
    for (const categoria of ['hardware', 'software', 'red', 'cuentas', 'otro']) {
      expect(validateTicketInput({ ...validInput, categoria }).ok).toBe(true);
    }
    for (const prioridad of ['baja', 'media', 'alta', 'critica']) {
      expect(validateTicketInput({ ...validInput, prioridad }).ok).toBe(true);
    }
  });

  it('rechaza categorías y prioridades desconocidas con sus mensajes exactos', () => {
    expect(validateTicketInput({ ...validInput, categoria: 'impresoras' })).toMatchObject({
      ok: false,
      error: { categoria: 'Selecciona una categoría.' },
    });
    expect(validateTicketInput({ ...validInput, categoria: '' })).toMatchObject({
      ok: false,
      error: { categoria: 'Selecciona una categoría.' },
    });
    expect(validateTicketInput({ ...validInput, prioridad: 'urgente' })).toMatchObject({
      ok: false,
      error: { prioridad: 'Selecciona una prioridad.' },
    });
    expect(validateTicketInput({ ...validInput, prioridad: '' })).toMatchObject({
      ok: false,
      error: { prioridad: 'Selecciona una prioridad.' },
    });
  });

  it('conserva tildes, eñes y símbolos al recortar', () => {
    const result = validateTicketInput({
      ...validInput,
      titulo: '  Configuración y señal ñ #2  ',
      descripcion: '  Atención: el botón “Guardar” no funciona.  ',
    });
    expect(result).toEqual({
      ok: true,
      value: {
        titulo: 'Configuración y señal ñ #2',
        descripcion: 'Atención: el botón “Guardar” no funciona.',
        categoria: 'hardware',
        prioridad: 'alta',
      },
    });
  });
});

describe('isValidTicket', () => {
  it('acepta un ticket válido y rechaza campos e invariantes inválidos', () => {
    const good = makeTicket();
    expect(isValidTicket(good)).toBe(true);
    expect(isValidTicket(null)).toBe(false);
    expect(isValidTicket({ ...good, titulo: 'a' })).toBe(false);
    expect(isValidTicket({ ...good, codigo: 0 })).toBe(false);
    expect(isValidTicket({ ...good, prioridad: 'urgente' })).toBe(false);
    expect(isValidTicket({ ...good, estado: 'resuelto' })).toBe(false);
    expect(isValidTicket({ ...good, creadoEn: 'no es fecha' })).toBe(false);
    expect(isValidTicket({ ...good, actualizadoEn: '2020-01-01T00:00:00.000Z' })).toBe(false);
    expect(isValidTicket({ ...good, resueltoEn: '2026-10-29T11:00:00.000Z' })).toBe(false);
  });

  it('acepta un ticket resuelto cuya fecha de resolución respeta la creación', () => {
    expect(isValidTicket(makeTicket({
      estado: 'resuelto',
      resueltoEn: '2026-10-29T11:00:00.000Z',
      actualizadoEn: '2026-10-29T11:00:00.000Z',
    }))).toBe(true);
  });
});

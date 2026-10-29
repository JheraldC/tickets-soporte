import {
  CATEGORIAS,
  DESCRIPCION_MAX,
  DESCRIPCION_MIN,
  ESTADOS,
  PRIORIDADES,
  TITULO_MAX,
  TITULO_MIN,
} from './constants';
import type { Categoria, Estado, Prioridad, Result, Ticket, TicketInput, TicketInputValido, ValidationErrors } from './types';

export function validateTicketInput(input: TicketInput): Result<TicketInputValido, ValidationErrors> {
  const titulo = typeof input.titulo === 'string' ? input.titulo.trim() : '';
  const descripcion = typeof input.descripcion === 'string' ? input.descripcion.trim() : '';
  const errors: ValidationErrors = {};

  if (!titulo) errors.titulo = 'El título es obligatorio.';
  else if (titulo.length < TITULO_MIN || titulo.length > TITULO_MAX) {
    errors.titulo = `El título debe tener entre ${TITULO_MIN} y ${TITULO_MAX} caracteres.`;
  }

  if (!descripcion) errors.descripcion = 'La descripción es obligatoria.';
  else if (descripcion.length < DESCRIPCION_MIN || descripcion.length > DESCRIPCION_MAX) {
    errors.descripcion = `La descripción debe tener entre ${DESCRIPCION_MIN} y ${DESCRIPCION_MAX} caracteres.`;
  }

  const categoria = input.categoria as Categoria;
  const prioridad = input.prioridad as Prioridad;
  if (!CATEGORIAS.includes(categoria)) errors.categoria = 'Selecciona una categoría.';
  if (!PRIORIDADES.includes(prioridad)) errors.prioridad = 'Selecciona una prioridad.';

  if (Object.keys(errors).length > 0) return { ok: false, error: errors };
  return { ok: true, value: { titulo, descripcion, categoria, prioridad } };
}

export function isValidTicket(value: unknown): value is Ticket {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const ticket = value as Record<string, unknown>;
  if (typeof ticket.id !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(ticket.id)) return false;
  if (typeof ticket.codigo !== 'number' || !Number.isSafeInteger(ticket.codigo) || ticket.codigo < 1) return false;
  if (typeof ticket.titulo !== 'string' || ticket.titulo !== ticket.titulo.trim() || ticket.titulo.length < TITULO_MIN || ticket.titulo.length > TITULO_MAX) return false;
  if (typeof ticket.descripcion !== 'string' || ticket.descripcion !== ticket.descripcion.trim() || ticket.descripcion.length < DESCRIPCION_MIN || ticket.descripcion.length > DESCRIPCION_MAX) return false;
  if (typeof ticket.categoria !== 'string' || !CATEGORIAS.includes(ticket.categoria as Categoria)) return false;
  if (typeof ticket.prioridad !== 'string' || !PRIORIDADES.includes(ticket.prioridad as Prioridad)) return false;
  if (typeof ticket.estado !== 'string' || !ESTADOS.includes(ticket.estado as Estado)) return false;
  if (typeof ticket.creadoEn !== 'string' || Number.isNaN(Date.parse(ticket.creadoEn))) return false;
  if (typeof ticket.actualizadoEn !== 'string' || Number.isNaN(Date.parse(ticket.actualizadoEn))) return false;
  if (Date.parse(ticket.creadoEn) > Date.parse(ticket.actualizadoEn)) return false;
  if (ticket.resueltoEn !== null && (typeof ticket.resueltoEn !== 'string' || Number.isNaN(Date.parse(ticket.resueltoEn)))) return false;
  if ((ticket.estado === 'resuelto') !== (ticket.resueltoEn !== null)) return false;
  if (typeof ticket.resueltoEn === 'string' && Date.parse(ticket.creadoEn) > Date.parse(ticket.resueltoEn)) return false;
  return true;
}

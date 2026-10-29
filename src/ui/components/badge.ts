import type { Estado, Prioridad } from '../../domain/types';
import { h } from '../dom';

const stateLabels: Record<Estado, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
};
const priorityLabels: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};
const stateIcons: Record<Estado, string> = { pendiente: '◷', en_proceso: '↻', resuelto: '✓' };
const priorityIcons: Record<Prioridad, string> = { baja: '↓', media: '•', alta: '↑', critica: '!' };

export function createBadge(kind: 'estado', value: Estado): HTMLElement;
export function createBadge(kind: 'prioridad', value: Prioridad): HTMLElement;
export function createBadge(kind: 'estado' | 'prioridad', value: Estado | Prioridad): HTMLElement {
  const isState = kind === 'estado';
  const label = isState ? stateLabels[value as Estado] : priorityLabels[value as Prioridad];
  const icon = isState ? stateIcons[value as Estado] : priorityIcons[value as Prioridad];
  return h('span', { className: `badge badge--${kind} badge--${String(value)}` },
    h('span', { className: 'badge-icon', 'aria-hidden': 'true' }, icon),
    h('span', null, label));
}

export function formatCodigo(code: number): string {
  return `TK-${String(code).padStart(4, '0')}`;
}

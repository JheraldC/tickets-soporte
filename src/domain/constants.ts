import type { Categoria, Estado, Prioridad } from './types';

export const CATEGORIES: readonly { value: Categoria; label: string }[] = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'red', label: 'Red' },
  { value: 'cuentas', label: 'Cuentas y accesos' },
  { value: 'otro', label: 'Otro' },
];

export const PRIORITIES: readonly { value: Prioridad; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

export const STATES: readonly { value: Estado; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelto', label: 'Resuelto' },
];

export const TITULO_MIN = 5;
export const TITULO_MAX = 100;
export const DESCRIPCION_MIN = 10;
export const DESCRIPCION_MAX = 1000;
export const STORAGE_KEY = 'tickets-soporte:v1';

export const CATEGORIAS = CATEGORIES.map((item) => item.value) as readonly Categoria[];
export const PRIORIDADES = PRIORITIES.map((item) => item.value) as readonly Prioridad[];
export const ESTADOS = STATES.map((item) => item.value) as readonly Estado[];

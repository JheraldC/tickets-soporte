export type Categoria = 'hardware' | 'software' | 'red' | 'cuentas' | 'otro';
export type Prioridad = 'baja' | 'media' | 'alta' | 'critica';
export type Estado = 'pendiente' | 'en_proceso' | 'resuelto';

export interface Ticket {
  id: string;
  codigo: number;
  titulo: string;
  descripcion: string;
  categoria: Categoria;
  prioridad: Prioridad;
  estado: Estado;
  creadoEn: string;
  actualizadoEn: string;
  resueltoEn: string | null;
}

export interface TicketInput {
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
}

export interface TicketInputValido extends Omit<TicketInput, 'categoria' | 'prioridad'> {
  categoria: Categoria;
  prioridad: Prioridad;
}

export interface ValidationErrors {
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  prioridad?: string;
}

export interface TicketQuery {
  texto: string;
  estado: Estado | 'todos';
  categoria: Categoria | 'todas';
  prioridad: Prioridad | 'todas';
}

export interface Estadisticas {
  total: number;
  porEstado: Record<Estado, { cantidad: number; porcentaje: number }>;
  porCategoria: Record<Categoria, number>;
  porPrioridad: Record<Prioridad, number>;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

# Data Model: Gestión de tickets de soporte técnico

**Feature**: `001-gestion-tickets-soporte` | **Date**: 2026-10-29 | **Plan**: [plan.md](./plan.md)

## Enumeraciones

| Tipo | Valores internos | Etiqueta en la UI |
| --- | --- | --- |
| `Categoria` | `hardware`, `software`, `red`, `cuentas`, `otro` | Hardware, Software, Red, Cuentas y accesos, Otro |
| `Prioridad` | `baja`, `media`, `alta`, `critica` | Baja, Media, Alta, Crítica (orden ascendente de urgencia) |
| `Estado` | `pendiente`, `en_proceso`, `resuelto` | Pendiente, En proceso, Resuelto |

Los valores internos se guardan en localStorage; las etiquetas solo existen en la UI.

## Entidad `Ticket`

| Campo | Tipo | Obligatorio | Origen | Reglas |
| --- | --- | --- | --- | --- |
| `id` | string (UUID) | Sí | Sistema | Único e inmutable (FR-006). |
| `codigo` | entero ≥ 1 | Sí | Sistema | Correlativo legible, se muestra como `TK-0001`; máximo existente + 1; nunca se reutiliza dentro de la colección actual. |
| `titulo` | string | Sí | Usuario | Tras `trim()`: 5–100 caracteres (FR-002). |
| `descripcion` | string | Sí | Usuario | Tras `trim()`: 10–1000 caracteres (FR-003). |
| `categoria` | `Categoria` | Sí | Usuario | Debe pertenecer a la enumeración (FR-004). |
| `prioridad` | `Prioridad` | Sí | Usuario | Debe pertenecer a la enumeración (FR-005). |
| `estado` | `Estado` | Sí | Sistema / usuario | `pendiente` al crear (FR-006, FR-016). |
| `creadoEn` | string ISO 8601 | Sí | Sistema | Fijado al crear; inmutable (FR-013). |
| `actualizadoEn` | string ISO 8601 | Sí | Sistema | Se actualiza en cada edición o cambio de estado efectivo. |
| `resueltoEn` | string ISO 8601 \| null | Sí (puede ser null) | Sistema | No nulo solo si `estado = resuelto` (FR-018). |

### Invariantes

1. `estado === 'resuelto'` ⇔ `resueltoEn !== null`.
2. `creadoEn ≤ actualizadoEn`, y si existe, `creadoEn ≤ resueltoEn`.
3. `id` y `codigo` son únicos en la colección.
4. Título y descripción se guardan ya recortados (sin espacios al inicio/fin), conservando tildes, eñes y símbolos tal cual.

## Entrada de usuario `TicketInput`

Datos que el formulario envía al dominio para crear o editar:

```text
TicketInput { titulo: string; descripcion: string; categoria: string; prioridad: string }
```

Resultado de validar: `{ ok: true, value: TicketInputValido } | { ok: false, errors: { titulo?, descripcion?, categoria?, prioridad? } }`.

### Mensajes de validación

| Campo | Condición | Mensaje |
| --- | --- | --- |
| titulo | vacío | "El título es obligatorio." |
| titulo | < 5 o > 100 | "El título debe tener entre 5 y 100 caracteres." |
| descripcion | vacía | "La descripción es obligatoria." |
| descripcion | < 10 o > 1000 | "La descripción debe tener entre 10 y 1000 caracteres." |
| categoria | vacía o fuera de lista | "Selecciona una categoría." |
| prioridad | vacía o fuera de lista | "Selecciona una prioridad." |

## Transiciones de estado

```text
            ┌──────────────┐
   crear ──▶│  pendiente   │◀──────────────┐
            └──────┬───────┘               │
                   │  ▲                    │
                   ▼  │                    │
            ┌──────────────┐        ┌──────┴──────┐
            │  en_proceso  │◀──────▶│  resuelto   │
            └──────────────┘        └─────────────┘
         (también pendiente ⇄ resuelto directamente)
```

- Cualquier estado puede pasar a cualquiera de los otros dos (FR-017).
- Al entrar en `resuelto`: `resueltoEn = ahora`.
- Al salir de `resuelto`: `resueltoEn = null`.
- Cambiar al mismo estado actual: sin cambios, no se actualiza `actualizadoEn` ni se escribe en almacenamiento.

## Criterios de consulta `TicketQuery`

```text
TicketQuery { texto: string; estado: Estado | 'todos'; categoria: Categoria | 'todas'; prioridad: Prioridad | 'todas' }
```

- `texto` se normaliza (sin tildes, minúsculas, sin espacios extremos) y se busca como subcadena en título y descripción.
- Los criterios se combinan con Y lógico (FR-020).
- Orden del resultado: `creadoEn` descendente (FR-009).

## Vista calculada `Estadisticas`

```text
Estadisticas {
  total: number
  porEstado:    Record<Estado,    { cantidad: number; porcentaje: number }>
  porCategoria: Record<Categoria, number>
  porPrioridad: Record<Prioridad, number>
}
```

Se calcula siempre a partir de la colección actual (FR-024); no se persiste. Con `total = 0`, todos los valores son 0 y los porcentajes 0 (sin división por cero).

## Formato de almacenamiento

Ver [contracts/storage-schema.md](./contracts/storage-schema.md).

# Contrato: esquema de almacenamiento en localStorage

**Clave**: `tickets-soporte:v1`
**Formato**: JSON (UTF-8)

```json
{
  "version": 1,
  "tickets": [
    {
      "id": "3f1c2a9e-8b7d-4c1e-9a2f-6d5e4b3c2a10",
      "codigo": 1,
      "titulo": "La impresora del piso 2 no imprime",
      "descripcion": "Desde esta mañana la impresora muestra error de papel atascado aunque no hay papel dentro.",
      "categoria": "hardware",
      "prioridad": "alta",
      "estado": "en_proceso",
      "creadoEn": "2026-10-29T15:20:00.000Z",
      "actualizadoEn": "2026-10-29T16:05:12.000Z",
      "resueltoEn": null
    }
  ]
}
```

## Reglas de lectura

| Situación | Comportamiento |
| --- | --- |
| La clave no existe | Colección vacía, sin aviso. |
| JSON inválido | Copia el texto a `tickets-soporte:v1:backup-<ISO>`, arranca con colección vacía y emite `StorageError('corrupted')` para que la UI avise (FR-027). |
| `version` distinta de 1 o `tickets` no es arreglo | Igual que JSON inválido. |
| Algún ticket no cumple el [modelo de datos](../data-model.md) | Se descartan solo los tickets inválidos, se conservan los válidos y se emite aviso `StorageError('partial')` con la cantidad descartada; el texto original se respalda como en el caso anterior. |
| localStorage no disponible (modo privado estricto, bloqueado) | La app funciona en memoria y muestra un aviso permanente de que los cambios no se conservarán. |

## Reglas de escritura

- Tras cada operación confirmada (crear, editar, cambiar estado, eliminar) se serializa y escribe la colección completa (FR-026).
- Si `setItem` lanza una excepción (p. ej. `QuotaExceededError`), el repositorio lanza `StorageError('write-failed')`; el servicio revierte el cambio en memoria y la UI informa que la operación no se completó (caso límite de la spec).
- No se guarda ningún dato distinto de los tickets (los criterios de filtro y la vista activa no se persisten).

## Evolución

Un cambio incompatible del formato incrementa `version` y la clave (`tickets-soporte:v2`), con una función de migración desde la versión anterior.

# Contrato: rutas y pantallas de la SPA

Navegación por hash; una ruta desconocida redirige a `#/tickets`.

| Ruta | Pantalla | Contenido principal | Historias / requisitos |
| --- | --- | --- | --- |
| `#/tickets` | Listado | Búsqueda, filtros (estado, categoría, prioridad), contador de resultados, botón "Limpiar", lista/tabla de tickets con etiquetas de estado y prioridad, acceso rápido a cambiar estado, botón "Nuevo ticket". Estado vacío y "sin resultados". | US1, US2, US4 · FR-009, FR-011, FR-019–FR-021 |
| `#/tickets/nuevo` | Formulario de alta | Campos título, descripción (con contador de caracteres), categoría, prioridad; botones Guardar y Cancelar; errores junto a cada campo. | US1 · FR-001–FR-008 |
| `#/tickets/:id` | Detalle | Todos los campos y fechas; selector de estado; botones Editar y Eliminar (con `<dialog>` de confirmación que muestra el título). | US1, US2, US3 · FR-010, FR-015–FR-018 |
| `#/tickets/:id/editar` | Formulario de edición | Mismo formulario precargado; Cancelar vuelve al detalle sin cambios. | US3 · FR-012–FR-014 |
| `#/estadisticas` | Estadísticas | Tarjetas: total, pendientes, en proceso, resueltos (cantidad y %); barras por categoría y por prioridad; mensaje si no hay datos. | US5 · FR-022–FR-024 |

## Elementos comunes

- Encabezado con nombre de la app y navegación (Tickets / Estadísticas); en móvil, navegación inferior o menú compacto.
- Zona de notificaciones (`role="status"`, `aria-live="polite"`) para confirmar operaciones (FR-008) y para errores de almacenamiento (`role="alert"`, FR-027).
- Si `:id` no existe, se muestra "Ticket no encontrado" con enlace al listado.

## Comportamiento responsive

| Ancho | Listado | Filtros | Formulario |
| --- | --- | --- | --- |
| < 640 px | Tarjetas apiladas | Panel desplegable "Filtros" | Una columna, botones a ancho completo |
| 640–1023 px | Tarjetas en 2 columnas | Barra en dos filas | Una columna centrada |
| ≥ 1024 px | Tabla con columnas ordenadas | Barra en una fila | Dos columnas (categoría y prioridad en paralelo) |

## Accesibilidad mínima

- Todos los controles tienen etiqueta visible; los errores se asocian con `aria-describedby` y el primer campo inválido recibe el foco.
- Navegación completa con teclado; foco visible; contraste WCAG AA en temas claro y oscuro.
- Estado y prioridad se comunican con texto (no solo color).

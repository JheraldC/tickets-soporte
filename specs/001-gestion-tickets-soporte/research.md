# Research: Gestión de tickets de soporte técnico

**Feature**: `001-gestion-tickets-soporte` | **Date**: 2026-10-29 | **Plan**: [plan.md](./plan.md)

Las tecnologías principales vienen fijadas por el usuario (HTML, CSS, TypeScript, Vite, localStorage, Vitest, SPA sin backend). Esta investigación resuelve las decisiones de detalle que esas elecciones dejan abiertas. No quedan elementos `NEEDS CLARIFICATION`.

## R1. Interfaz sin framework de componentes

- **Decision**: TypeScript "vanilla" con manipulación directa del DOM, organizado en vistas (funciones `render`/`mount`) por pantalla y componentes pequeños reutilizables.
- **Rationale**: El usuario pide HTML, CSS y TypeScript; el alcance (5 pantallas o paneles, un solo tipo de entidad) no justifica React, Vue u otro framework. Menos dependencias y un bundle pequeño.
- **Alternatives considered**: React/Vue/Svelte (añaden dependencias y una capa de abstracción no pedida); Web Components con Shadow DOM (complica el estilo global y las pruebas sin beneficio claro).

## R2. Arquitectura modular por capas

- **Decision**: Tres capas con dependencias en un solo sentido: `ui → domain ← storage`. La capa `domain` (modelo, validación, servicio de tickets, filtros y estadísticas) no conoce el DOM ni localStorage; recibe un repositorio por inyección (`TicketRepository`). `storage` implementa ese repositorio sobre localStorage. `ui` solo llama al servicio.
- **Rationale**: Cumple la separación pedida, permite probar toda la lógica de negocio con Vitest usando un repositorio en memoria y facilita cambiar el almacenamiento en el futuro.
- **Alternatives considered**: Un único módulo con estado global (difícil de probar); patrón MVC completo con controladores por vista (más ceremonia de la necesaria).

## R3. Estado de la interfaz y re-renderizado

- **Decision**: Un pequeño `store` observable en `ui/state.ts` que guarda la lista de tickets, los criterios de búsqueda/filtro y la vista activa; las vistas se suscriben y se vuelven a renderizar al cambiar. Navegación por hash (`#/tickets`, `#/tickets/nuevo`, `#/tickets/:id`, `#/tickets/:id/editar`, `#/estadisticas`).
- **Rationale**: El router por hash funciona sin configuración de servidor (cualquier hosting estático) y conserva el botón "atrás". Un store mínimo evita sincronizar a mano varias vistas.
- **Alternatives considered**: History API (requiere fallback en el servidor estático); librería de estado (innecesaria para este tamaño).

## R4. Persistencia en localStorage

- **Decision**: Una sola clave `tickets-soporte:v1` con un objeto `{ version: 1, tickets: Ticket[] }` en JSON. Se escribe la colección completa tras cada operación confirmada. Al leer: si falta la clave → colección vacía; si el JSON es inválido o no cumple el esquema → se informa al usuario, se conserva una copia del contenido dañado en `tickets-soporte:v1:backup-<timestamp>` y se arranca vacío. Los errores de escritura (`QuotaExceededError`, almacenamiento deshabilitado) se convierten en un `StorageError` que la UI muestra.
- **Rationale**: Unos pocos miles de tickets ocupan muy por debajo del límite habitual de ~5 MB. Escribir la colección entera es simple y atómico desde el punto de vista del usuario. El campo `version` permite migraciones futuras. Cumple FR-025 a FR-027.
- **Alternatives considered**: Una clave por ticket (lecturas y recuentos más complejos); IndexedDB (asíncrono y más complejo, innecesario para este volumen); sessionStorage (no persiste al cerrar).

## R5. Identificadores y fechas

- **Decision**: `id` generado con `crypto.randomUUID()`; además un número correlativo legible (`codigo`, mostrado como `TK-0001`) calculado como máximo existente + 1. Fechas guardadas como texto ISO 8601 (UTC) y mostradas con `Intl.DateTimeFormat('es-PE')`.
- **Rationale**: El UUID garantiza unicidad incluso tras eliminar tickets; el código corto es más fácil de comunicar entre usuario y técnico. ISO 8601 se serializa sin pérdida en JSON.
- **Alternatives considered**: Solo correlativo (riesgo de reutilizar números tras eliminar si no se gestiona); `Date.now()` como id (posibles colisiones).

## R6. Validación

- **Decision**: Función pura `validateTicketInput(input) → { ok, errors: Partial<Record<Campo, string>> }` en el dominio, con mensajes en español. Aplica `trim()` antes de medir. Se usa igual para crear y editar. La UI valida al enviar y, tras el primer intento, en cada cambio del campo; se apoya en atributos HTML (`required`, `maxlength`) solo como ayuda, nunca como única validación.
- **Rationale**: Una sola fuente de reglas (FR-002 a FR-005, FR-007, FR-012) probada con Vitest; la validación del navegador por sí sola no da mensajes uniformes ni es comprobable en el dominio.
- **Alternatives considered**: Librerías de esquemas (Zod, Valibot): útiles, pero añaden una dependencia para cuatro campos.

## R7. Búsqueda insensible a mayúsculas y tildes

- **Decision**: Normalizar con `texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()` tanto el término como título y descripción; filtrar en memoria. Entrada de búsqueda con *debounce* de 150 ms.
- **Rationale**: Cumple FR-019 sin dependencias; filtrar 500–5000 objetos en memoria toma milisegundos (SC-004).
- **Alternatives considered**: Índice de texto completo (innecesario a esta escala); `localeCompare` con `sensitivity: 'base'` (sirve para comparar, no para "contiene").

## R8. Estadísticas y gráficos

- **Decision**: Función pura `computeStats(tickets)` que devuelve totales, conteos y porcentajes por estado, categoría y prioridad. Visualización con tarjetas de resumen y barras horizontales hechas con HTML/CSS (ancho proporcional), con la cifra escrita junto a cada barra.
- **Rationale**: Cumple FR-022 a FR-024 sin librería de gráficos; las barras con texto son accesibles y responsive por naturaleza.
- **Alternatives considered**: Chart.js u otra librería (dependencia y peso extra); `<canvas>` propio (peor accesibilidad).

## R9. Diseño visual responsive

- **Decision**: CSS propio con variables (tokens de color, espaciado, radios), enfoque *mobile-first* y breakpoints en 640 px y 1024 px. En móvil, el listado se muestra como tarjetas y los filtros en un panel desplegable; en escritorio, tabla/rejilla con barra de filtros visible. Soporte de tema claro/oscuro con `prefers-color-scheme`. Estados y prioridades como etiquetas con texto e icono, no solo color (FR-011). Foco visible, contraste AA y diálogos accesibles (`<dialog>` nativo para confirmar eliminaciones).
- **Rationale**: Interfaz moderna e intuitiva sin framework CSS; `<dialog>` resuelve foco y teclado de forma nativa.
- **Alternatives considered**: Tailwind o Bootstrap (dependencias no pedidas; el usuario pidió CSS).

## R10. Pruebas con Vitest

- **Decision**: Vitest con entorno `jsdom` para pruebas de UI y `node` para dominio. Niveles: unitarias del dominio (validación, servicio, filtros, estadísticas, transiciones de estado), del repositorio localStorage (incluidos datos dañados y cuota excedida simulada) e integración de vistas (montar la app en jsdom, rellenar formulario, comprobar listado y persistencia). Cobertura con `@vitest/coverage-v8`, objetivo ≥ 90 % en `src/domain` y `src/storage`.
- **Rationale**: Vitest se integra con la configuración de Vite y TypeScript sin pasos extra; jsdom incluye `localStorage`.
- **Alternatives considered**: Jest (configuración adicional para ESM/TS); Playwright E2E (útil, pero fuera de lo pedido; se puede añadir después).

## R11. Herramientas y versiones

- **Decision**: Node.js 22 LTS (instalado: v22.14.0), npm, Vite (plantilla `vanilla-ts`), TypeScript en modo `strict`, Vitest y jsdom en sus versiones estables vigentes al crear el proyecto, fijadas en `package-lock.json`.
- **Rationale**: Herramientas ya presentes en el entorno del laboratorio; el lockfile garantiza instalaciones reproducibles.
- **Alternatives considered**: pnpm/yarn (no instalados en el entorno; npm basta).

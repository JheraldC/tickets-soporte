# Implementation Plan: Gestión de tickets de soporte técnico

**Branch**: `001-gestion-tickets-soporte` | **Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-gestion-tickets-soporte/spec.md`

**Note**: This template is filled in by the `$speckit-plan` command; its definition describes the execution workflow.

## Summary

Aplicación web de una sola página (SPA) para registrar, consultar, editar, eliminar, buscar, filtrar y cambiar el estado de tickets de soporte técnico, con un panel de estadísticas y persistencia local entre sesiones. Se construye con HTML, CSS y TypeScript sobre Vite, sin backend, guardando los datos en localStorage. El código se divide en tres capas: interfaz (`src/ui`), lógica de negocio pura (`src/domain`) y almacenamiento (`src/storage`), conectadas mediante un repositorio inyectado. Vitest cubre dominio, almacenamiento e integración de vistas en jsdom. La interfaz es *mobile-first*, con tarjetas en móvil y tabla en escritorio, tema claro/oscuro y accesibilidad básica (ver [research.md](./research.md)).

## Technical Context

**Language/Version**: TypeScript 5.x en modo `strict` (ES2022), HTML5, CSS3 (variables, grid, flexbox, `@media`, `prefers-color-scheme`)

**Primary Dependencies**: Vite (plantilla `vanilla-ts`) como servidor de desarrollo y empaquetador; sin framework de UI ni librerías de gráficos en tiempo de ejecución

**Storage**: `window.localStorage`, clave `tickets-soporte:v1`, JSON versionado ([contracts/storage-schema.md](./contracts/storage-schema.md))

**Testing**: Vitest + jsdom (`@vitest/coverage-v8` para cobertura)

**Target Platform**: Navegadores actuales de escritorio y móvil (Chrome, Edge, Firefox, Safari — últimas 2 versiones); despliegue como archivos estáticos

**Project Type**: Aplicación web frontend (SPA estática, sin backend)

**Performance Goals**: Búsqueda/filtros sobre 500 tickets < 1 s (SC-004; objetivo interno < 50 ms); primera carga interactiva < 2 s en conexión 4G; bundle JS < 50 KB gzip

**Constraints**: Sin servidor ni red en tiempo de ejecución; funciona sin conexión una vez cargada; datos limitados a la cuota de localStorage (~5 MB); interfaz en español; sin desplazamiento horizontal desde 320 px

**Scale/Scope**: Un usuario/equipo; hasta unos pocos miles de tickets; 5 pantallas (listado, alta, detalle, edición, estadísticas)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` sigue siendo la plantilla sin completar: no define principios, restricciones ni reglas de gobierno. Por lo tanto no hay puertas que evaluar ni violaciones que justificar.

| Momento | Resultado | Observación |
| --- | --- | --- |
| Antes de Phase 0 | PASS (sin principios definidos) | No hay reglas que puedan bloquear el plan. |
| Después de Phase 1 | PASS (sin principios definidos) | El diseño respeta igualmente las prácticas que suelen exigir las constituciones: separación por capas, pruebas automatizadas y simplicidad (sin dependencias de UI). |

Recomendación: ejecutar `$speckit-constitution` y luego volver a comprobar este plan (o `$speckit-analyze`) antes de `$speckit-implement`.

## Project Structure

### Documentation (this feature)

```text
specs/001-gestion-tickets-soporte/
├── plan.md              # Este archivo ($speckit-plan)
├── research.md          # Phase 0: decisiones técnicas
├── data-model.md        # Phase 1: entidades, validaciones, estados
├── quickstart.md        # Phase 1: guía de ejecución y validación
├── contracts/
│   ├── domain-api.md    # Interfaces entre ui, domain y storage
│   ├── storage-schema.md# Formato y reglas de localStorage
│   └── ui-routes.md     # Rutas, pantallas y comportamiento responsive
├── checklists/
│   └── requirements.md  # Checklist de calidad de la spec ($speckit-specify)
└── tasks.md             # Phase 2 ($speckit-tasks; aún no creado)
```

### Source Code (repository root)

```text
index.html                     # Punto de entrada de Vite (contenedor #app)
package.json                   # Scripts: dev, build, preview, test, test:watch, coverage
tsconfig.json                  # strict, ES2022, DOM
vite.config.ts                 # Configuración de Vite y Vitest (jsdom, cobertura)

src/
├── main.ts                    # Composición: crea repositorio, servicio y monta la UI
├── domain/                    # Lógica de negocio pura (sin DOM ni localStorage)
│   ├── types.ts               # Ticket, TicketInput, Estado, Categoria, Prioridad, Result
│   ├── constants.ts           # Listas de valores, etiquetas y límites de longitud
│   ├── ports.ts               # TicketRepository, Clock, IdGenerator, StorageError
│   ├── validation.ts          # validateTicketInput
│   ├── status.ts              # applyStatusChange
│   ├── query.ts               # normalizeText, filterTickets
│   ├── stats.ts               # computeStats
│   └── ticketService.ts       # createTicketService (CRUD, estados, suscripción)
├── storage/
│   ├── localStorageRepository.ts  # Persistencia JSON versionada, respaldo de datos dañados
│   └── memoryRepository.ts        # Repositorio en memoria (pruebas / sin almacenamiento)
├── ui/
│   ├── router.ts              # Router por hash
│   ├── state.ts               # Store de UI: criterios de filtro, vista activa
│   ├── dom.ts                 # Utilidades para crear elementos y escapar texto
│   ├── components/
│   │   ├── badge.ts           # Etiquetas de estado y prioridad (texto + icono)
│   │   ├── ticketForm.ts      # Formulario de alta/edición con errores por campo
│   │   ├── filterBar.ts       # Búsqueda (debounce) y filtros
│   │   ├── confirmDialog.ts   # <dialog> de confirmación
│   │   └── toast.ts           # Notificaciones aria-live
│   └── views/
│       ├── listView.ts
│       ├── formView.ts
│       ├── detailView.ts
│       └── statsView.ts
└── styles/
    ├── tokens.css             # Variables de color, espaciado, tipografía; tema claro/oscuro
    ├── base.css               # Reset y estilos base
    ├── layout.css             # Encabezado, navegación, rejillas responsive
    └── components.css         # Tarjetas, tabla, formularios, badges, barras, diálogos

tests/
├── unit/
│   ├── domain/                # validation, status, query, stats, ticketService
│   └── storage/               # localStorageRepository (vacío, dañado, cuota excedida)
└── integration/
    └── ui/                    # Montaje en jsdom: alta, validaciones, filtros, eliminación, estadísticas, persistencia
```

**Structure Decision**: Proyecto único de frontend en la raíz del repositorio (no hay backend). La separación pedida se materializa en `src/domain`, `src/storage` y `src/ui`, con las reglas de dependencia de [contracts/domain-api.md](./contracts/domain-api.md); `src/main.ts` es el único punto de composición. Las pruebas se separan en unitarias (dominio y almacenamiento) e integración (UI en jsdom).

## Mapa de requisitos a diseño

| Requisitos | Módulos principales | Pruebas |
| --- | --- | --- |
| FR-001–FR-008 (registro y validaciones) | `domain/validation.ts`, `domain/ticketService.ts`, `ui/components/ticketForm.ts` | `unit/domain/validation`, `integration/ui/alta` |
| FR-009–FR-011 (consulta) | `ui/views/listView.ts`, `ui/views/detailView.ts`, `ui/components/badge.ts` | `integration/ui/listado` |
| FR-012–FR-015 (edición y eliminación) | `domain/ticketService.ts`, `ui/views/formView.ts`, `ui/components/confirmDialog.ts` | `unit/domain/ticketService`, `integration/ui/eliminacion` |
| FR-016–FR-018 (estados) | `domain/status.ts` | `unit/domain/status` |
| FR-019–FR-021 (búsqueda y filtros) | `domain/query.ts`, `ui/components/filterBar.ts` | `unit/domain/query` (incl. 500 tickets), `integration/ui/filtros` |
| FR-022–FR-024 (estadísticas) | `domain/stats.ts`, `ui/views/statsView.ts` | `unit/domain/stats`, `integration/ui/estadisticas` |
| FR-025–FR-027 (persistencia) | `storage/localStorageRepository.ts`, `ui/components/toast.ts` | `unit/storage/*`, `integration/ui/persistencia` |

## Complexity Tracking

No aplica: la constitución no define principios y el diseño no introduce complejidad que requiera justificación.

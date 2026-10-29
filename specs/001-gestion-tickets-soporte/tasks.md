---

description: "Lista de tareas para implementar la gestión de tickets de soporte técnico"
---

# Tasks: Gestión de tickets de soporte técnico

**Input**: Design documents from `/specs/001-gestion-tickets-soporte/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Solicitadas explícitamente (TDD con Vitest) y obligatorias por el Principio III de la constitución. En cada fase, las tareas de pruebas se escriben primero y DEBEN fallar antes de implementar.

**Organization**: Las tareas se agrupan por historia de usuario (US1–US5, en el orden de prioridad de spec.md) para implementarlas y probarlas de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia a la que pertenece la tarea (US1–US5)
- Cada tarea indica la ruta exacta del archivo

## Path Conventions

Proyecto único de frontend en la raíz del repositorio: `src/` (capas `domain`, `storage`, `ui`, `styles`) y `tests/` (`unit/`, `integration/`), según [plan.md](./plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Proyecto Vite con TypeScript strict, Vitest con jsdom y cobertura, y estructura de carpetas

- [X] T001 Inicializar en la raíz del repositorio un proyecto Vite con plantilla `vanilla-ts` (sin sobrescribir `docs/`, `specs/`, `.specify/`, `.agents/`, `scripts/` ni `AGENTS.md`), dejando `index.html` con un único contenedor `<main id="app">`, `lang="es"` y `<meta name="viewport" content="width=device-width, initial-scale=1">` en index.html
- [X] T002 Definir en package.json los scripts `dev` (`vite`), `build` (`tsc --noEmit && vite build`), `preview` (`vite preview`), `test` (`vitest run`), `test:watch` (`vitest`) y `coverage` (`vitest run --coverage`), e instalar como dependencias de desarrollo `typescript`, `vite`, `vitest`, `jsdom` y `@vitest/coverage-v8`, versionando package-lock.json
- [X] T003 [P] Configurar tsconfig.json con `"strict": true`, `"target": "ES2022"`, `"lib": ["ES2022", "DOM", "DOM.Iterable"]`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true` e incluir `src` y `tests`
- [X] T004 [P] Crear vite.config.ts con configuración de Vitest: `environment: 'jsdom'`, `include: ['tests/**/*.test.ts']`, cobertura `provider: 'v8'` sobre `src/domain/**` y `src/storage/**` con umbral `lines: 90`
- [X] T005 [P] Crear las carpetas `src/domain/`, `src/storage/`, `src/ui/components/`, `src/ui/views/`, `src/styles/`, `tests/unit/domain/`, `tests/unit/storage/`, `tests/integration/ui/` y eliminar los archivos de ejemplo de la plantilla (`src/counter.ts`, `src/style.css`, `src/typescript.svg`, `public/vite.svg`)
- [X] T006 [P] Añadir `node_modules/`, `dist/` y `coverage/` a .gitignore
- [X] T007 Verificar que `npm run build` y `npm test` (con `--passWithNoTests` temporal si aún no hay pruebas) se ejecutan sin errores en package.json

**Checkpoint**: Proyecto compila y Vitest arranca

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos, constantes, puertos, validación, repositorios, servicio base y armazón de la UI que necesitan todas las historias

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta completar esta fase

### Tests for Foundational ⚠️

> **NOTE: Escribir estas pruebas PRIMERO y comprobar que FALLAN antes de implementar**

- [X] T008 [P] Pruebas de `validateTicketInput` en tests/unit/domain/validation.test.ts: título "Tras `trim()`: 5–100 caracteres" (casos 4, 5, 100 y 101 caracteres, solo espacios, espacios extremos recortados); descripción "Tras `trim()`: 10–1000 caracteres" (9, 10, 1000, 1001); categoría "Debe pertenecer a la enumeración" `hardware|software|red|cuentas|otro`; prioridad "Debe pertenecer a la enumeración" `baja|media|alta|critica`; mensajes exactos "El título es obligatorio.", "El título debe tener entre 5 y 100 caracteres.", "La descripción es obligatoria.", "La descripción debe tener entre 10 y 1000 caracteres.", "Selecciona una categoría.", "Selecciona una prioridad."; conservación de tildes, eñes y símbolos
- [X] T009 [P] Pruebas del repositorio en tests/unit/storage/localStorageRepository.test.ts según contracts/storage-schema.md: clave `tickets-soporte:v1` ausente → colección vacía sin aviso; ida y vuelta de `{ "version": 1, "tickets": [...] }`; JSON inválido → respaldo en `tickets-soporte:v1:backup-<ISO>`, colección vacía y `StorageError('corrupted')`; `version` distinta de 1 o `tickets` no arreglo → igual que corrupto; tickets inválidos mezclados → se conservan los válidos y `StorageError('partial')`; `setItem` que lanza `QuotaExceededError` → `StorageError('write-failed')`; `Storage` que lanza al acceder → `StorageError('unavailable')`
- [X] T010 [P] Pruebas del repositorio en memoria en tests/unit/storage/memoryRepository.test.ts (carga inicial, `saveAll` reemplaza la colección, aislamiento de copias)
- [X] T011 [P] Pruebas base del servicio en tests/unit/domain/ticketService.base.test.ts: `list()` ordena por `creadoEn` descendente, `get(id)` devuelve `undefined` si no existe, `subscribe` notifica y su función de baja deja de notificar, el aviso de lectura del repositorio queda disponible para la UI
- [X] T012 [P] Pruebas del router en tests/integration/ui/router.test.ts: resuelve `#/tickets`, `#/tickets/nuevo`, `#/tickets/:id`, `#/tickets/:id/editar`, `#/estadisticas`; ruta desconocida redirige a `#/tickets`

### Implementation for Foundational

- [X] T013 [P] Definir en src/domain/types.ts los tipos `Categoria` (`'hardware' | 'software' | 'red' | 'cuentas' | 'otro'`), `Prioridad` (`'baja' | 'media' | 'alta' | 'critica'`), `Estado` (`'pendiente' | 'en_proceso' | 'resuelto'`), `Ticket` (`id`, `codigo`, `titulo`, `descripcion`, `categoria`, `prioridad`, `estado`, `creadoEn`, `actualizadoEn`, `resueltoEn: string | null`), `TicketInput`, `ValidationErrors`, `TicketQuery`, `Estadisticas` y `Result<T, E>` según data-model.md y contracts/domain-api.md
- [X] T014 [P] Definir en src/domain/constants.ts las listas ordenadas de categorías, prioridades y estados con sus etiquetas en español (Hardware, Software, Red, Cuentas y accesos, Otro; Baja, Media, Alta, Crítica; Pendiente, En proceso, Resuelto), los límites `TITULO_MIN = 5`, `TITULO_MAX = 100`, `DESCRIPCION_MIN = 10`, `DESCRIPCION_MAX = 1000` y la clave `STORAGE_KEY = 'tickets-soporte:v1'`
- [X] T015 Definir en src/domain/ports.ts las interfaces `TicketRepository` (`load(): { tickets: Ticket[]; warning?: StorageError }`, `saveAll(tickets: readonly Ticket[]): void`), `Clock`, `IdGenerator` y la clase `StorageError` con `kind: 'corrupted' | 'partial' | 'write-failed' | 'unavailable'` (depende de T013)
- [X] T016 Implementar `validateTicketInput` en src/domain/validation.ts aplicando `trim()` y las reglas y mensajes de data-model.md, más una función `isValidTicket(value: unknown): value is Ticket` que compruebe las invariantes del modelo para el repositorio (depende de T013–T015; hace pasar T008)
- [X] T017 [P] Implementar `createMemoryRepository(initial?: Ticket[])` en src/storage/memoryRepository.ts (hace pasar T010)
- [X] T018 Implementar `createLocalStorageRepository(storage?: Storage, key?: string)` en src/storage/localStorageRepository.ts siguiendo contracts/storage-schema.md y usando `isValidTicket` (depende de T016; hace pasar T009)
- [X] T019 Implementar el armazón de `createTicketService({ repository, clock, ids })` en src/domain/ticketService.ts con `list`, `get`, `subscribe`, `getLoadWarning` y un método interno `commit(next)` que llama a `repository.saveAll`, revierte el estado en memoria si lanza `StorageError` y solo notifica tras guardar (depende de T015; hace pasar T011)
- [X] T020 [P] Implementar en src/ui/dom.ts el helper `h(tag, attrs, ...children)` que crea elementos y asigna texto siempre con `textContent` (nunca `innerHTML` con datos de usuario), y `formatDate(iso)` con `Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })`
- [X] T021 [P] Implementar el router por hash en src/ui/router.ts (`createRouter(routes, onNotFound)`, escucha `hashchange`, extrae `:id`) (hace pasar T012)
- [X] T022 [P] Implementar notificaciones en src/ui/components/toast.ts: región `role="status"` `aria-live="polite"` para confirmaciones y `role="alert"` para errores de almacenamiento
- [X] T023 [P] Crear src/styles/tokens.css (variables de color, espaciado, radios, tipografía; tema claro y oscuro con `prefers-color-scheme`, contraste WCAG AA), src/styles/base.css (reset, tipografía, `:focus-visible`) y src/styles/layout.css (encabezado, navegación Tickets/Estadísticas, contenedor principal, breakpoints 640 px y 1024 px)
- [X] T024 Implementar `mountApp(root: HTMLElement, service: TicketService)` en src/ui/app.ts: encabezado con navegación, zona de notificaciones, salida de vistas conectada al router y aviso de `getLoadWarning()` al iniciar (depende de T019–T022)
- [X] T025 Implementar la composición en src/main.ts: importar los CSS, crear `createLocalStorageRepository()` (o `createMemoryRepository()` con aviso permanente si `localStorage` no está disponible), `createTicketService` con `crypto.randomUUID` y reloj del sistema, y llamar a `mountApp(document.getElementById('app'))` (depende de T018, T024)

**Checkpoint**: Pruebas de la fase pasan; la app abre con encabezado y navegación vacíos

---

## Phase 3: User Story 1 - Registrar y consultar tickets (Priority: P1) 🎯 MVP

**Goal**: Registrar tickets válidos, verlos en el listado y en el detalle, y conservarlos al cerrar y reabrir la aplicación

**Independent Test**: Registrar varios tickets válidos, recargar (o montar la app de nuevo sobre el mismo `localStorage`) y comprobar que listado y detalle muestran exactamente los datos ingresados (quickstart escenarios 1–3)

### Tests for User Story 1 ⚠️

> **NOTE: Escribir estas pruebas PRIMERO y comprobar que FALLAN antes de implementar**

- [X] T026 [P] [US1] Pruebas de `create` en tests/unit/domain/ticketService.create.test.ts: entrada válida → `estado: 'pendiente'`, `id` del generador, `codigo` = máximo existente + 1 (1 si vacío), `creadoEn = actualizadoEn` del reloj, `resueltoEn: null`, título y descripción recortados; entrada inválida → `{ ok: false, error }` sin llamar a `saveAll`; `saveAll` que lanza `StorageError('write-failed')` → la lista no cambia y el error se propaga; se permiten títulos duplicados
- [X] T027 [P] [US1] Prueba de integración del alta en tests/integration/ui/alta.test.ts: completar el formulario de `#/tickets/nuevo` y guardar → el ticket aparece primero en `#/tickets` con estado "Pendiente" y código `TK-0001`, y se muestra confirmación; guardar con título "abc", descripción vacía y sin categoría ni prioridad → 4 mensajes junto a los campos (asociados con `aria-describedby`), el texto escrito se conserva y el foco va al primer campo inválido; los errores desaparecen al corregir; el contador de caracteres de la descripción se actualiza
- [X] T028 [P] [US1] Prueba de integración del listado y detalle en tests/integration/ui/listado.test.ts: sin tickets → mensaje de estado vacío con invitación a registrar; con tickets → cada fila/tarjeta muestra código, título, categoría, prioridad, estado y fecha de creación, ordenados del más reciente al más antiguo; estado y prioridad muestran texto (no solo color); `#/tickets/:id` muestra todos los campos y fechas; id inexistente → "Ticket no encontrado" con enlace al listado
- [X] T029 [P] [US1] Prueba de integración de persistencia en tests/integration/ui/persistencia.test.ts: crear 3 tickets, desmontar y volver a montar la app sobre el mismo `localStorage` → mismos tickets y datos; valor dañado en `tickets-soporte:v1` → la app abre, muestra alerta y permite registrar; `setItem` que falla → alerta de error y el ticket no aparece como guardado

### Implementation for User Story 1

- [X] T030 [US1] Implementar `create(input)` en src/domain/ticketService.ts usando `validateTicketInput`, cálculo de `codigo` y `commit` (hace pasar T026)
- [X] T031 [P] [US1] Implementar etiquetas de estado y prioridad en src/ui/components/badge.ts (texto + icono + clase por valor, sin depender solo del color) y la utilidad `formatCodigo(n)` → `TK-0001`
- [X] T032 [P] [US1] Implementar el formulario reutilizable en src/ui/components/ticketForm.ts: campos con etiqueta visible, `maxlength` 100/1000 como ayuda, contador de caracteres, selects con opción vacía "Selecciona…", errores por campo con `aria-describedby`, foco al primer inválido, validación al enviar y en vivo tras el primer intento, callbacks `onSubmit` y `onCancel`, modo alta/edición con valores iniciales
- [X] T033 [US1] Implementar la vista de alta en src/ui/views/formView.ts para `#/tickets/nuevo`: usa `ticketForm`, llama a `service.create`, muestra errores de validación o de almacenamiento, confirma con toast y navega al listado (depende de T030, T032)
- [X] T034 [US1] Implementar la vista de listado en src/ui/views/listView.ts para `#/tickets`: botón "Nuevo ticket", estado vacío, tarjetas en móvil y tabla en ≥ 1024 px, enlace de cada ticket a su detalle, re-render al notificar el servicio (depende de T031)
- [X] T035 [US1] Implementar la vista de detalle de solo lectura en src/ui/views/detailView.ts para `#/tickets/:id`: código, título, descripción (respetando saltos de línea), categoría, prioridad, estado, creación, última modificación y resolución si existe; caso "Ticket no encontrado" (depende de T031)
- [X] T036 [US1] Registrar las rutas `#/tickets`, `#/tickets/nuevo` y `#/tickets/:id` en src/ui/app.ts (depende de T033–T035)
- [X] T037 [P] [US1] Estilos de tarjetas, tabla, formulario, mensajes de error, contador, badges y toasts en src/styles/components.css (botones a ancho completo en < 640 px, dos columnas categoría/prioridad en ≥ 1024 px)

**Checkpoint**: US1 funciona y se valida sola (MVP): T026–T029 pasan y los escenarios 1–3 de quickstart.md se cumplen

---

## Phase 4: User Story 2 - Cambiar el estado de un ticket (Priority: P2)

**Goal**: Pasar tickets entre Pendiente, En proceso y Resuelto, incluida la reapertura, con fechas coherentes

**Independent Test**: Con un ticket existente (sembrado en el repositorio), cambiar su estado por los tres valores y comprobar listado, detalle y fechas, también tras volver a montar la app (quickstart escenario 4)

### Tests for User Story 2 ⚠️

- [X] T038 [P] [US2] Pruebas de `applyStatusChange` en tests/unit/domain/status.test.ts: cualquier estado → cualquiera de los otros dos; entrar en `resuelto` fija `resueltoEn = now`; salir de `resuelto` pone `resueltoEn = null`; se actualiza `actualizadoEn`; invariante "`estado === 'resuelto'` ⇔ `resueltoEn !== null`"; mismo estado → devuelve el ticket sin cambios
- [X] T039 [P] [US2] Pruebas de `changeStatus` en tests/unit/domain/ticketService.status.test.ts: id inexistente → `'not-found'`; valor fuera de `pendiente|en_proceso|resuelto` → `'invalid-status'`; mismo estado → `ok` sin `saveAll` ni notificación; fallo de guardado → revierte
- [X] T040 [P] [US2] Prueba de integración en tests/integration/ui/estados.test.ts: desde el detalle, Pendiente → En proceso → Resuelto (aparece fecha de resolución) → Pendiente (desaparece); desde el listado el cambio se hace en ≤ 2 acciones; el selector solo ofrece los tres estados; los cambios persisten al volver a montar

### Implementation for User Story 2

- [X] T041 [US2] Implementar `applyStatusChange(t, estado, now)` en src/domain/status.ts (hace pasar T038)
- [X] T042 [US2] Implementar `changeStatus(id, estado)` en src/domain/ticketService.ts usando `applyStatusChange` y `commit` (depende de T041; hace pasar T039)
- [X] T043 [US2] Añadir en src/ui/views/detailView.ts un selector de estado accesible (etiqueta visible, tres opciones) que llama a `service.changeStatus` y confirma con toast
- [X] T044 [US2] Añadir en src/ui/views/listView.ts un control rápido de estado por ticket (select compacto con etiqueta accesible) para cambiar el estado en ≤ 2 acciones (hace pasar T040)

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Editar y eliminar tickets (Priority: P3)

**Goal**: Corregir los datos de un ticket y eliminar tickets con confirmación

**Independent Test**: Editar cada campo de un ticket sembrado y verificar que persiste; eliminar con confirmación y comprobar que desaparece del listado, también tras volver a montar (quickstart escenarios 5–6)

### Tests for User Story 3 ⚠️

- [X] T045 [P] [US3] Pruebas de `update` y `remove` en tests/unit/domain/ticketService.update-remove.test.ts: `update` valida con las mismas reglas que el alta, no cambia `id`, `codigo` ni `creadoEn`, actualiza `actualizadoEn`; datos inválidos → no guarda; id inexistente → `'not-found'`; `remove` elimina y persiste; `remove` de id inexistente → `'not-found'`; fallo de guardado → revierte
- [X] T046 [P] [US3] Prueba de integración en tests/integration/ui/edicion.test.ts: `#/tickets/:id/editar` precarga los valores; guardar cambios válidos → detalle actualizado y toast; datos inválidos → mismos mensajes que el alta; Cancelar → vuelve al detalle sin cambios
- [X] T047 [P] [US3] Prueba de integración en tests/integration/ui/eliminacion.test.ts: "Eliminar" abre un `<dialog>` que muestra el título del ticket; Cancelar → el ticket permanece; Confirmar → desaparece del listado y tras volver a montar; eliminar el último ticket → estado vacío

### Implementation for User Story 3

- [X] T048 [US3] Implementar `update(id, input)` y `remove(id)` en src/domain/ticketService.ts (hace pasar T045)
- [X] T049 [P] [US3] Implementar `confirmDialog({ title, message, confirmLabel })` con `<dialog>` nativo en src/ui/components/confirmDialog.ts (foco inicial en Cancelar, Escape cancela, devuelve `Promise<boolean>`)
- [X] T050 [US3] Extender src/ui/views/formView.ts con el modo edición para `#/tickets/:id/editar` (precarga, `service.update`, Cancelar vuelve a `#/tickets/:id`) y registrar la ruta en src/ui/app.ts (hace pasar T046)
- [X] T051 [US3] Añadir botones "Editar" y "Eliminar" en src/ui/views/detailView.ts; eliminar usa `confirmDialog`, llama a `service.remove`, confirma con toast y navega a `#/tickets` (depende de T049; hace pasar T047)
- [X] T052 [P] [US3] Estilos del diálogo de confirmación y de los botones de acción (variante peligrosa para eliminar) en src/styles/components.css

**Checkpoint**: US1–US3 funcionan de forma independiente

---

## Phase 6: User Story 4 - Buscar y filtrar tickets (Priority: P4)

**Goal**: Localizar tickets por texto y combinar filtros por estado, categoría y prioridad

**Independent Test**: Con un conjunto sembrado de tickets variados, aplicar búsquedas y combinaciones de filtros y comprobar que solo aparecen los que cumplen todo (quickstart escenario 7)

### Tests for User Story 4 ⚠️

- [X] T053 [P] [US4] Pruebas en tests/unit/domain/query.test.ts: `normalizeText` elimina tildes, pasa a minúsculas y recorta espacios; `filterTickets` busca subcadena en título y descripción ("IMPRESORA" encuentra "impresora", "configuracion" encuentra "configuración"); filtros `estado`, `categoria`, `prioridad` con valores `'todos'`/`'todas'`; combinación con Y lógico; orden `creadoEn` descendente; con 500 tickets generados el filtrado termina en < 1000 ms
- [X] T054 [P] [US4] Prueba de integración en tests/integration/ui/filtros.test.ts: escribir en la búsqueda (tras el debounce de 150 ms) filtra el listado; combinar búsqueda y filtros; se muestra el número de resultados; sin coincidencias → mensaje "sin resultados" con acción "Limpiar"; "Limpiar" restaura el listado completo; editar o cambiar el estado de un ticket con filtro activo actualiza los resultados

### Implementation for User Story 4

- [X] T055 [US4] Implementar `normalizeText` y `filterTickets` en src/domain/query.ts y exponer `query(criteria)` en src/domain/ticketService.ts (hace pasar T053)
- [X] T056 [P] [US4] Implementar en src/ui/state.ts un store observable con los criterios `TicketQuery` (`texto`, `estado`, `categoria`, `prioridad`), valores iniciales "todos/todas" y `reset()` (no se persiste)
- [X] T057 [US4] Implementar la barra de búsqueda y filtros en src/ui/components/filterBar.ts: campo de búsqueda con etiqueta y debounce de 150 ms, tres selects, botón "Limpiar"; en < 640 px los filtros se muestran en un panel desplegable "Filtros" (depende de T056)
- [X] T058 [US4] Integrar `filterBar`, el contador de resultados y el estado "sin resultados" en src/ui/views/listView.ts usando `service.query(state)` (depende de T055, T057; hace pasar T054)
- [X] T059 [P] [US4] Estilos de la barra de filtros (una fila en ≥ 1024 px, dos filas en 640–1023 px, panel desplegable en < 640 px) en src/styles/components.css

**Checkpoint**: US1–US4 funcionan de forma independiente

---

## Phase 7: User Story 5 - Visualizar estadísticas (Priority: P5)

**Goal**: Ver el total de tickets y su distribución por estado, categoría y prioridad

**Independent Test**: Sembrar un conjunto conocido de tickets y comparar las cifras mostradas con el recuento manual; sin tickets todo aparece en 0 (quickstart escenario 8)

### Tests for User Story 5 ⚠️

- [X] T060 [P] [US5] Pruebas de `computeStats` en tests/unit/domain/stats.test.ts: `total`; `porEstado` con `cantidad` y `porcentaje` (redondeado a 1 decimal, suma ≈ 100); `porCategoria` y `porPrioridad` incluyen todas las claves aunque valgan 0; con `total = 0` todo es 0 sin división por cero
- [X] T061 [P] [US5] Prueba de integración en tests/integration/ui/estadisticas.test.ts: `#/estadisticas` muestra tarjetas de total, Pendiente, En proceso y Resuelto con cantidad y %; barras por categoría y prioridad con la cifra escrita; tras crear, cambiar estado o eliminar un ticket, las cifras se actualizan; sin tickets → ceros y mensaje "aún no hay datos"

### Implementation for User Story 5

- [X] T062 [US5] Implementar `computeStats(tickets)` en src/domain/stats.ts y exponer `stats()` en src/domain/ticketService.ts (hace pasar T060)
- [X] T063 [US5] Implementar la vista src/ui/views/statsView.ts con tarjetas de resumen y barras horizontales HTML/CSS (ancho proporcional, cifra y etiqueta visibles, `role="img"` con `aria-label` descriptivo por gráfico) y re-render al notificar el servicio (depende de T062)
- [X] T064 [US5] Registrar la ruta `#/estadisticas` y activar el enlace "Estadísticas" de la navegación en src/ui/app.ts (depende de T063; hace pasar T061)
- [X] T065 [P] [US5] Estilos de tarjetas de resumen y barras (rejilla de 2 columnas en móvil y 4 en escritorio) en src/styles/components.css

**Checkpoint**: Todas las historias funcionan de forma independiente

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Diseño responsive, accesibilidad, seguridad, cobertura, compilación y validación final

- [X] T066 [P] Prueba de seguridad en tests/integration/ui/seguridad.test.ts: un ticket con título `<img src=x onerror=alert(1)>` y descripción `<script>…</script>` se muestra como texto literal en listado, detalle y diálogo, sin crear elementos
- [X] T067 [P] Prueba de casos límite en tests/integration/ui/casos-limite.test.ts: título/descripción solo con espacios rechazados; búsqueda con espacios extremos; caracteres especiales, tildes y eñes conservados
- [X] T068 Revisión responsive en src/styles/layout.css y src/styles/components.css: sin desplazamiento horizontal a 320, 375, 768 y 1280 px; objetivos táctiles ≥ 44 px; navegación compacta en móvil
- [X] T069 Revisión de accesibilidad WCAG 2.1 AA en src/styles/tokens.css y las vistas de src/ui/views/: contraste ≥ 4.5:1 en temas claro y oscuro, foco visible, navegación completa con teclado, etiquetas en todos los controles, `aria-current` en la navegación, títulos de página (`document.title`) por ruta
- [X] T070 Ejecutar `npm run coverage` y añadir pruebas en tests/unit/ hasta alcanzar ≥ 90 % de líneas en src/domain y src/storage
- [X] T071 Ejecutar `npm run build` sin errores de TypeScript ni advertencias, confirmar que no hay `any` injustificado ni `console.log` en src/, y que el JS de dist/ pesa < 50 KB gzip
- [X] T072 [P] Crear README.md en la raíz con descripción, requisitos (Node.js 22 LTS), comandos `npm` y estructura de capas
- [X] T073 Validar manualmente los 10 escenarios de specs/001-gestion-tickets-soporte/quickstart.md con `npm run preview` (incluidos datos dañados y responsive) y anotar el resultado en docs/bitacora-laboratorio.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias
- **Foundational (Phase 2)**: Depende de Setup; BLOQUEA todas las historias
- **User Stories (Phases 3–7)**: Dependen de Foundational
- **Polish (Phase 8)**: Depende de las historias que se vayan a entregar

### User Story Dependencies

- **US1 (P1)**: Solo depende de Foundational. Es el MVP.
- **US2 (P2)**: La lógica (`status.ts`, `changeStatus`) solo depende de Foundational; la UI extiende `detailView.ts` y `listView.ts` creados en US1.
- **US3 (P3)**: La lógica (`update`, `remove`) solo depende de Foundational; la UI reutiliza `ticketForm.ts`, `formView.ts` y `detailView.ts` de US1.
- **US4 (P4)**: La lógica (`query.ts`) solo depende de Foundational; la UI se integra en `listView.ts` de US1.
- **US5 (P5)**: La lógica (`stats.ts`) y la vista `statsView.ts` solo dependen de Foundational.
- Las pruebas de US2–US5 siembran los tickets directamente en el repositorio, por lo que cada historia se valida sin depender de las demás.

### Within Each User Story

- Pruebas primero; deben FALLAR antes de implementar
- Dominio (funciones puras) → servicio → componentes de UI → vistas → registro de rutas → estilos
- Completar la historia y su checkpoint antes de pasar a la siguiente prioridad
- Ejecutar `npm test` y `npm run build` antes de cada commit (constitución, Flujo de trabajo)

### Parallel Opportunities

- Setup: T003, T004, T005, T006
- Foundational: pruebas T008–T012 entre sí; T013, T014, T017, T020–T023 entre sí
- Cada historia: todas sus pruebas [P] entre sí; componentes y estilos [P] en paralelo con la lógica
- Tras Foundational, la lógica de dominio de US2–US5 (T041, T048, T055, T062) puede avanzar en paralelo con US1, porque toca archivos distintos (salvo `ticketService.ts`, que se edita de forma secuencial)

---

## Parallel Example: User Story 1

```text
# Pruebas de US1 en paralelo:
Task: "T026 Pruebas de create en tests/unit/domain/ticketService.create.test.ts"
Task: "T027 Prueba de integración del alta en tests/integration/ui/alta.test.ts"
Task: "T028 Prueba de integración del listado y detalle en tests/integration/ui/listado.test.ts"
Task: "T029 Prueba de integración de persistencia en tests/integration/ui/persistencia.test.ts"

# Componentes y estilos de US1 en paralelo con T030:
Task: "T031 Etiquetas en src/ui/components/badge.ts"
Task: "T032 Formulario en src/ui/components/ticketForm.ts"
Task: "T037 Estilos en src/styles/components.css"
```

## Parallel Example: User Story 4

```text
Task: "T053 Pruebas en tests/unit/domain/query.test.ts"
Task: "T054 Prueba de integración en tests/integration/ui/filtros.test.ts"
Task: "T056 Store de criterios en src/ui/state.ts"
Task: "T059 Estilos de la barra de filtros en src/styles/components.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloquea todo lo demás)
3. Completar Phase 3: US1
4. **DETENERSE Y VALIDAR**: `npm test`, `npm run build` y escenarios 1–3 de quickstart.md
5. Commit y demostración del MVP

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar → commit (MVP)
3. US2 → validar → commit
4. US3 → validar → commit
5. US4 → validar → commit
6. US5 → validar → commit
7. Polish → cobertura, build y quickstart completos → commit final

---

## Notes

- [P] = archivos distintos y sin dependencias pendientes
- [USn] vincula cada tarea con su historia para trazabilidad
- `src/ui/app.ts` (`mountApp`) no figura en el árbol de plan.md; se añade para que las pruebas de integración monten la app sin depender de `main.ts`, que queda solo como punto de composición
- Verificar que las pruebas fallan antes de implementar
- Evitar tareas vagas, conflictos en el mismo archivo y dependencias entre historias que rompan su independencia

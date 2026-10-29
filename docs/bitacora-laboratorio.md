# Bitácora del laboratorio — Sistema de Tickets de Soporte Técnico

**Proyecto:** tickets-soporte
**Ubicación actual:** C:\Users\LENOVO\Documents\VScode\tickets-soporte
**Repositorio:** [JheraldC/tickets-soporte](https://github.com/JheraldC/tickets-soporte)

Esta bitácora resume los comandos y prompts de Spec Kit, los archivos que generan y sus resultados. El registro técnico completo se conserva localmente en `.lab-logs/`, excluida de Git.

## Paso 0: Inicialización de Spec Kit para Codex

**Ejecución:** 28/10/2026, 13:34:54 (Lima).
**Comando ejecutado en PowerShell:**

```powershell
specify init tickets-soporte --integration codex
```

El comando creó la base de Spec Kit dentro de `tickets-soporte`. En el selector de scripts se eligió `ps` (PowerShell). La inicialización terminó con el mensaje `Project ready`.

| Elemento generado | Resultado |
| --- | --- |
| `.specify/templates/` | Plantillas para las futuras especificaciones, planes y tareas. |
| `.specify/scripts/powershell/` | Scripts auxiliares del flujo de Spec Kit. |
| `.specify/memory/constitution.md` | Plantilla para definir los principios del proyecto; todavía sin completar. |
| `.specify/init-options.json` y `.specify/integration.json` | Configuración de Codex, scripts PowerShell y versión de Spec Kit. |
| `.specify/integrations/` y `.specify/workflows/` | Manifiestos de integración y definición del flujo de trabajo. |
| `.agents/skills/` | Diez habilidades de Spec Kit disponibles para Codex, como `$speckit-specify`, `$speckit-plan` y `$speckit-tasks`. |

**Verificación ejecutada desde el proyecto:**

```powershell
specify integration status
```

Salida relevante:

```text
Integration status: OK
Default integration: codex
Modified managed files: 0
Missing managed files: 0
```

**Resultado:** Spec Kit 1.2.4 quedó inicializado para Codex. Los requisitos, el diseño, las tareas y el código de la aplicación todavía no se han generado.

Antes de Specify, queda pendiente definir los principios del proyecto mediante `$speckit-constitution`, como recomienda la guía oficial.

## Paso 1: Specify — Requisitos

**Ejecución:** 29/10/2026, 10:14 (Lima).
**Prompt ejecutado:**

```text
$speckit-specify Desarrolla una aplicación web para gestionar tickets de soporte técnico. Su objetivo es organizar y dar
seguimiento a las incidencias informáticas. Los usuarios podrán registrar tickets con título, descripción, categoría y
prioridad; consultar, editar, eliminar, buscar y filtrar tickets; cambiar su estado entre pendiente, en proceso y resuelto; y
visualizar estadísticas. La información debe conservarse al cerrar y volver a abrir la aplicación. Incluye validaciones y
criterios de aceptación.
```

| Archivo | Resultado |
| --- | --- |
| `specs/001-gestion-tickets-soporte/spec.md` | Especificación con 5 historias de usuario priorizadas (registro y consulta, estados, edición y eliminación, búsqueda y filtros, estadísticas), 27 requisitos funcionales, casos límite, entidades y 8 criterios de éxito medibles. |
| `specs/001-gestion-tickets-soporte/checklists/requirements.md` | Lista de calidad de la especificación: 16/16 ítems aprobados en la primera iteración. |
| `.specify/feature.json` | Ruta de la funcionalidad activa para `$speckit-plan` y las etapas siguientes (estado local, excluido de Git). |

**Resultado:** Especificación lista para planificar, sin marcadores `[NEEDS CLARIFICATION]`. Las decisiones no indicadas en el prompt (categorías Hardware, Software, Red, Cuentas y accesos, Otro; prioridades Baja a Crítica; límites de 5–100 caracteres para el título y 10–1000 para la descripción; uso sin cuentas de usuario; persistencia local) se registraron como supuestos. No hubo hooks de extensión registrados. La constitución sigue sin definirse.

## Paso 2: Plan — Diseño técnico

**Ejecución:** 29/10/2026, 10:20 (Lima).
**Prompt ejecutado:**

```text
$speckit-plan Utiliza HTML, CSS y TypeScript con Vite. Desarrolla una SPA responsive sin backend, utilizando localStorage
para persistencia. Implementa una arquitectura modular separando interfaz, lógica de negocio y almacenamiento. Utiliza
Vitest para pruebas automatizadas. Disena una interfaz moderna, intuitiva y adaptable a moviles y computadoras.
```

El script `.specify/scripts/powershell/setup-plan.ps1 -Json` copió la plantilla del plan en la carpeta de la funcionalidad.

| Archivo | Resultado |
| --- | --- |
| `specs/001-gestion-tickets-soporte/plan.md` | Contexto técnico (TypeScript strict, Vite, localStorage, Vitest + jsdom), estructura de carpetas `src/domain`, `src/storage`, `src/ui`, `src/styles` y `tests/`, y mapa de requisitos a módulos y pruebas. |
| `specs/001-gestion-tickets-soporte/research.md` | 11 decisiones técnicas con alternativas descartadas (TypeScript sin framework, capas con repositorio inyectado, router por hash, formato de localStorage, validación, búsqueda sin tildes, gráficos con CSS, diseño responsive, pruebas). |
| `specs/001-gestion-tickets-soporte/data-model.md` | Entidad `Ticket`, enumeraciones, invariantes, mensajes de validación y transiciones de estado. |
| `specs/001-gestion-tickets-soporte/contracts/` | `domain-api.md` (interfaces entre capas), `storage-schema.md` (formato JSON y manejo de errores) y `ui-routes.md` (pantallas y comportamiento responsive). |
| `specs/001-gestion-tickets-soporte/quickstart.md` | Comandos `npm` y 10 escenarios de validación manual y automatizada. |

**Resultado:** Diseño completo sin elementos `NEEDS CLARIFICATION`. El Constitution Check se marcó como PASS sin principios que evaluar, porque la constitución sigue sin definirse. No hubo hooks de extensión registrados.

## Paso 3: Tasks — Generación de tareas

Pendiente. No se ha ejecutado `$speckit-tasks`.

## Paso 4: Implement — Implementación

Pendiente. No se ha ejecutado `$speckit-implement`.

## Paso 5: Converge — Verificación final

Pendiente. No se ha ejecutado `$speckit-converge`.

## Problemas encontrados y soluciones

La comprobación de la integración no presenta errores pendientes. Los detalles de instalación, permisos y reintentos se conservan en los registros locales de respaldo.

## Conclusiones del laboratorio

La base de Spec Kit está preparada para comenzar el desarrollo guiado por especificaciones con Codex. Las siguientes etapas se documentarán con el prompt utilizado, los archivos generados o modificados y un resumen breve del resultado.

Referencia: [Quickstart oficial de GitHub Spec Kit](https://github.github.com/spec-kit/quickstart.html).

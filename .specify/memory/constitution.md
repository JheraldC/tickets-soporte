# Sistema de Tickets de Soporte Técnico Constitution

## Core Principles

### I. Separación por capas

- El código MUST dividirse en tres capas independientes: interfaz (`src/ui`), lógica de
  negocio (`src/domain`) y almacenamiento (`src/storage`).
- La lógica de negocio MUST NOT acceder al DOM, a `window`, a `document` ni a `localStorage`;
  recibe el almacenamiento mediante una interfaz inyectada.
- La interfaz MUST NOT leer ni escribir en `localStorage` directamente; usa los servicios del
  dominio.
- Las dependencias van en un solo sentido (`ui → domain ← storage`) y solo el punto de entrada
  de la aplicación conecta las capas.

**Rationale**: Permite probar la lógica sin navegador, cambiar el almacenamiento sin tocar las
reglas de negocio y mantener cada parte comprensible por separado.

### II. Calidad del código TypeScript

- TypeScript MUST compilar en modo `strict` sin errores ni advertencias suprimidas.
- El tipo `any` MUST NOT usarse salvo que se justifique en un comentario junto a su uso; se
  prefieren `unknown` y tipos explícitos.
- Las funciones SHOULD ser pequeñas y con una sola responsabilidad; los nombres MUST describir
  su propósito (identificadores en inglés o español, de forma coherente dentro de cada módulo).
- No se deja código muerto, comentado o de depuración (`console.log`) en el código integrado.

**Rationale**: El tipado estricto detecta errores antes de ejecutar y el código claro facilita
la revisión y el mantenimiento en un proyecto de laboratorio compartido.

### III. Pruebas obligatorias con Vitest (NON-NEGOTIABLE)

- Toda regla de negocio, validación, transición de estado, filtro y cálculo de estadísticas
  MUST tener pruebas automatizadas con Vitest.
- La cobertura de líneas MUST ser al menos del 90 % en `src/domain` y `src/storage`.
- Los flujos principales de la interfaz MUST cubrirse con pruebas de integración en jsdom.
- No se integra (commit a la rama principal) código con pruebas fallidas o con la compilación
  rota.

**Rationale**: Las pruebas son la evidencia de que se cumplen los criterios de aceptación de la
especificación y evitan regresiones al avanzar entre etapas.

### IV. Experiencia de usuario consistente

- Todos los textos visibles MUST estar en español.
- La interfaz MUST ser responsive y utilizable sin desplazamiento horizontal desde 320 px de
  ancho hasta escritorio.
- La interfaz MUST cumplir WCAG 2.1 nivel AA en contraste, ser operable completamente con
  teclado, mostrar el foco visible y no comunicar estados ni prioridades solo mediante color.
- Los errores MUST mostrarse con mensajes claros que indiquen qué ocurrió y cómo corregirlo,
  junto al campo afectado cuando aplique; cada operación exitosa MUST confirmarse al usuario.

**Rationale**: La aplicación la usan personas que reportan incidencias desde distintos
dispositivos; una interfaz predecible y accesible reduce errores y consultas.

### V. Simplicidad

- La aplicación MUST ser una SPA estática sin backend, construida con HTML, CSS y TypeScript
  sobre Vite, con persistencia en `localStorage`.
- Las dependencias de ejecución MUST mantenerse al mínimo; cualquier librería nueva MUST
  justificarse en el plan (problema que resuelve y por qué no basta la plataforma).
- Se aplica YAGNI: no se implementan funciones fuera de la especificación vigente.

**Rationale**: Menos piezas significa menos fallos, menor tamaño de descarga y un proyecto más
fácil de entender y evaluar.

### VI. Integridad de datos

- Toda entrada del usuario MUST validarse en la capa de dominio antes de guardarse, también en
  la edición.
- Ninguna operación confirmada por el usuario puede perderse: cada cambio MUST guardarse en el
  momento de la confirmación, y si el guardado falla, el cambio se revierte y se avisa.
- Los datos almacenados dañados o ilegibles MUST detectarse, respaldarse y notificarse sin
  bloquear la aplicación.
- El formato almacenado MUST estar versionado para permitir migraciones.

**Rationale**: La utilidad del sistema depende de que el historial de incidencias sea fiable;
una pérdida silenciosa de datos invalida el seguimiento.

## Restricciones técnicas

- Stack: HTML5, CSS3 propio (sin framework CSS), TypeScript, Vite, Vitest con jsdom; Node.js 22
  LTS y npm, con `package-lock.json` versionado.
- Plataformas: últimas dos versiones de Chrome, Edge, Firefox y Safari, en escritorio y móvil.
- Rendimiento: búsqueda y filtros sobre 500 tickets en menos de 1 segundo.
- Seguridad: el texto ingresado por usuarios MUST insertarse en el DOM como texto (nunca como
  HTML interpretado); no se publican credenciales ni datos personales en el repositorio.

## Flujo de trabajo y calidad

- El desarrollo sigue GitHub Spec Kit: constitution → specify → plan → tasks → implement →
  converge. Ninguna etapa se ejecuta sin autorización del usuario.
- Cada etapa ejecutada MUST documentarse en `docs/bitacora-laboratorio.md` con fecha, prompt o
  comando, archivos generados o modificados y resumen del resultado.
- Al terminar cada etapa, los cambios MUST publicarse con un commit descriptivo (formato
  `tipo: descripción`, por ejemplo `docs:`, `feat:`, `test:`, `fix:`).
- Antes de cada commit con código: `npm test` y `npm run build` MUST pasar.
- Los planes MUST incluir el Constitution Check y justificar en Complexity Tracking cualquier
  excepción a estos principios.

## Governance

- Esta constitución prevalece sobre cualquier otra práctica del proyecto. Los planes, tareas e
  implementaciones MUST verificar su cumplimiento.
- Toda enmienda MUST hacerse mediante `$speckit-constitution`, registrarse en la bitácora y
  publicarse con un commit, actualizando versión y fecha de última enmienda.
- Versionado semántico: MAJOR para eliminar o redefinir principios de forma incompatible; MINOR
  para añadir principios o secciones o ampliar materialmente su alcance; PATCH para
  aclaraciones y correcciones de redacción.
- El cumplimiento se revisa en el Constitution Check de cada plan y antes de dar por terminada
  la etapa de implementación (`$speckit-converge`).

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29

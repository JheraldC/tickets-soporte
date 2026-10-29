# Feature Specification: Gestión de tickets de soporte técnico

**Feature Branch**: `001-gestion-tickets-soporte`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Desarrolla una aplicación web para gestionar tickets de soporte técnico. Su objetivo es organizar y dar seguimiento a las incidencias informáticas. Los usuarios podrán registrar tickets con título, descripción, categoría y prioridad; consultar, editar, eliminar, buscar y filtrar tickets; cambiar su estado entre pendiente, en proceso y resuelto; y visualizar estadísticas. La información debe conservarse al cerrar y volver a abrir la aplicación. Incluye validaciones y criterios de aceptación."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar y consultar tickets (Priority: P1)

Un usuario detecta una incidencia informática (por ejemplo, una impresora que no responde) y la registra como ticket indicando título, descripción, categoría y prioridad. El ticket aparece en el listado con estado "Pendiente" y el usuario puede abrirlo para ver todos sus datos. Al cerrar y volver a abrir la aplicación, los tickets registrados siguen disponibles.

**Why this priority**: Sin registro, consulta y conservación de los datos no existe seguimiento de incidencias; es el núcleo mínimo viable de la aplicación.

**Independent Test**: Registrar varios tickets válidos, cerrar la aplicación, volver a abrirla y comprobar que el listado y el detalle de cada ticket muestran exactamente los datos ingresados.

**Acceptance Scenarios**:

1. **Given** el formulario de registro vacío, **When** el usuario completa título, descripción, categoría y prioridad válidos y confirma, **Then** el ticket se guarda con un identificador único, estado "Pendiente" y fecha de creación, y aparece en el listado.
2. **Given** el formulario de registro, **When** el usuario intenta guardar con el título vacío o con menos de 5 caracteres, **Then** el ticket no se guarda y se muestra junto al campo un mensaje que indica la regla incumplida.
3. **Given** el formulario de registro, **When** el usuario no selecciona categoría o prioridad, **Then** el ticket no se guarda y se indica qué campo falta.
4. **Given** un formulario con errores de validación, **When** el usuario corrige los campos, **Then** los mensajes de error desaparecen y conserva lo que ya había escrito.
5. **Given** tickets registrados, **When** el usuario cierra y vuelve a abrir la aplicación, **Then** el listado muestra los mismos tickets con los mismos datos y estados.
6. **Given** un listado con tickets, **When** el usuario selecciona uno, **Then** se muestra su identificador, título, descripción, categoría, prioridad, estado, fecha de creación y fecha de última modificación.
7. **Given** que no existen tickets, **When** el usuario abre el listado, **Then** se muestra un mensaje indicando que no hay tickets y una invitación a registrar el primero.

---

### User Story 2 - Cambiar el estado de un ticket (Priority: P2)

Un técnico toma un ticket pendiente y lo marca "En proceso"; cuando soluciona la incidencia, lo marca "Resuelto". Si el problema reaparece, puede devolverlo a un estado anterior.

**Why this priority**: El seguimiento de la incidencia depende de conocer en qué etapa se encuentra cada ticket; es el siguiente valor después de registrarlo.

**Independent Test**: Con un ticket existente, cambiar su estado por los tres valores posibles y comprobar que el listado, el detalle y la fecha de última modificación reflejan cada cambio, también tras reabrir la aplicación.

**Acceptance Scenarios**:

1. **Given** un ticket en estado "Pendiente", **When** el usuario lo cambia a "En proceso", **Then** el ticket muestra el nuevo estado y se actualiza su fecha de última modificación.
2. **Given** un ticket en estado "En proceso", **When** el usuario lo cambia a "Resuelto", **Then** el ticket muestra "Resuelto" y registra la fecha de resolución.
3. **Given** un ticket "Resuelto", **When** el usuario lo cambia a "Pendiente" o "En proceso", **Then** el ticket se reabre con el nuevo estado y se elimina la fecha de resolución.
4. **Given** cualquier ticket, **When** el usuario intenta asignar un estado distinto de "Pendiente", "En proceso" o "Resuelto", **Then** el sistema no lo permite (solo se ofrecen esos tres valores).

---

### User Story 3 - Editar y eliminar tickets (Priority: P3)

El usuario corrige datos de un ticket registrado (por ejemplo, ajusta la prioridad o amplía la descripción) o elimina un ticket creado por error.

**Why this priority**: Mantener la información exacta y depurar registros erróneos mejora la calidad del seguimiento, pero la aplicación ya aporta valor sin esta función.

**Independent Test**: Editar cada campo de un ticket existente, verificar que los cambios persisten; eliminar un ticket confirmando la acción y comprobar que ya no aparece en el listado ni tras reabrir la aplicación.

**Acceptance Scenarios**:

1. **Given** un ticket existente, **When** el usuario modifica título, descripción, categoría o prioridad con valores válidos y guarda, **Then** los cambios se conservan y se actualiza la fecha de última modificación, sin alterar el identificador ni la fecha de creación.
2. **Given** la edición de un ticket, **When** el usuario introduce datos que incumplen las validaciones, **Then** no se guardan los cambios y se muestran los mismos mensajes que en el registro.
3. **Given** la edición de un ticket, **When** el usuario cancela, **Then** el ticket conserva sus datos originales.
4. **Given** un ticket existente, **When** el usuario elige eliminarlo, **Then** el sistema solicita confirmación mostrando el título del ticket.
5. **Given** la solicitud de confirmación, **When** el usuario confirma, **Then** el ticket desaparece del listado, de las búsquedas y de las estadísticas de forma permanente.
6. **Given** la solicitud de confirmación, **When** el usuario cancela, **Then** el ticket permanece sin cambios.

---

### User Story 4 - Buscar y filtrar tickets (Priority: P4)

Con muchas incidencias registradas, el usuario necesita localizar rápidamente un ticket por palabras clave o ver solo los que cumplen ciertos criterios (por ejemplo, los pendientes de prioridad alta de la categoría Red).

**Why this priority**: Su valor crece con el volumen de tickets; con pocos registros el listado completo es suficiente.

**Independent Test**: Con un conjunto de tickets de distintas categorías, prioridades y estados, aplicar búsquedas y combinaciones de filtros y verificar que solo aparecen los tickets que cumplen todas las condiciones.

**Acceptance Scenarios**:

1. **Given** tickets registrados, **When** el usuario escribe un texto en la búsqueda, **Then** se muestran solo los tickets cuyo título o descripción contienen ese texto, sin distinguir mayúsculas, minúsculas ni tildes.
2. **Given** tickets registrados, **When** el usuario filtra por estado, categoría o prioridad, **Then** se muestran solo los tickets que coinciden con el valor elegido.
3. **Given** una búsqueda y varios filtros activos, **When** se aplican a la vez, **Then** se muestran solo los tickets que cumplen todas las condiciones y se indica cuántos resultados hay.
4. **Given** una búsqueda o filtros sin coincidencias, **When** se aplican, **Then** se muestra un mensaje de "sin resultados" y la opción de limpiar los criterios.
5. **Given** criterios activos, **When** el usuario los limpia, **Then** vuelve a verse el listado completo.

---

### User Story 5 - Visualizar estadísticas (Priority: P5)

Un responsable de soporte quiere conocer de un vistazo la carga de trabajo: cuántos tickets hay, cuántos están pendientes, en proceso y resueltos, y cómo se distribuyen por categoría y prioridad.

**Why this priority**: Aporta una visión de conjunto útil para la gestión, pero depende de que existan tickets y de que su estado se mantenga actualizado.

**Independent Test**: Registrar un conjunto conocido de tickets con estados, categorías y prioridades definidos y comparar las cifras mostradas con el recuento manual.

**Acceptance Scenarios**:

1. **Given** tickets registrados, **When** el usuario abre las estadísticas, **Then** ve el total de tickets y la cantidad y el porcentaje por estado (Pendiente, En proceso, Resuelto).
2. **Given** tickets registrados, **When** el usuario abre las estadísticas, **Then** ve la cantidad de tickets por categoría y por prioridad, incluida una representación visual comparativa.
3. **Given** que se registra, edita, cambia de estado o elimina un ticket, **When** el usuario vuelve a las estadísticas, **Then** las cifras reflejan el cambio.
4. **Given** que no existen tickets, **When** el usuario abre las estadísticas, **Then** se muestran todas las cifras en cero y un mensaje indicando que aún no hay datos, sin errores.

---

### Edge Cases

- Título o descripción compuestos solo por espacios: se tratan como vacíos y se rechazan; los espacios al inicio y al final se eliminan antes de validar y guardar.
- Texto que supera la longitud máxima: el sistema impide guardar e indica el límite (y muestra cuántos caracteres quedan mientras se escribe).
- Caracteres especiales, tildes, eñes o símbolos en título y descripción: se guardan y muestran tal como se escribieron, sin interpretarse como formato o código.
- Dos tickets con el mismo título: se permiten, porque cada uno tiene identificador propio.
- Cambiar un ticket al mismo estado que ya tiene: no produce cambios ni actualiza la fecha de modificación.
- Eliminar el último ticket existente: el listado muestra el estado vacío y las estadísticas quedan en cero.
- Datos guardados ilegibles o dañados al abrir la aplicación: se informa al usuario con un mensaje claro y la aplicación sigue utilizable en lugar de bloquearse.
- Fallo al guardar (por ejemplo, espacio de almacenamiento agotado): se informa al usuario que la operación no se completó y no se muestra como guardado un ticket que no se conservó.
- Ticket editado o eliminado mientras está activo un filtro: el listado filtrado se actualiza de inmediato (el ticket sale de los resultados si deja de cumplir los criterios).
- Búsqueda con espacios al inicio o al final: se ignoran esos espacios.

## Requirements *(mandatory)*

### Functional Requirements

**Registro y validaciones**

- **FR-001**: El sistema DEBE permitir registrar un ticket con título, descripción, categoría y prioridad.
- **FR-002**: El título DEBE ser obligatorio y tener entre 5 y 100 caracteres, sin contar espacios al inicio y al final.
- **FR-003**: La descripción DEBE ser obligatoria y tener entre 10 y 1000 caracteres, sin contar espacios al inicio y al final.
- **FR-004**: La categoría DEBE ser obligatoria y elegirse de la lista: Hardware, Software, Red, Cuentas y accesos, Otro.
- **FR-005**: La prioridad DEBE ser obligatoria y elegirse de la lista: Baja, Media, Alta, Crítica.
- **FR-006**: El sistema DEBE asignar automáticamente a cada ticket nuevo un identificador único e inmutable, el estado "Pendiente", la fecha y hora de creación y la fecha y hora de última modificación.
- **FR-007**: Ante datos inválidos, el sistema DEBE impedir el guardado, mostrar junto a cada campo afectado un mensaje en español que explique la regla incumplida y conservar los datos ya escritos.
- **FR-008**: El sistema DEBE confirmar visualmente al usuario cada registro, edición, cambio de estado o eliminación realizado con éxito.

**Consulta**

- **FR-009**: El sistema DEBE mostrar un listado de todos los tickets con, al menos, identificador, título, categoría, prioridad, estado y fecha de creación, ordenado por defecto del más reciente al más antiguo.
- **FR-010**: El sistema DEBE permitir ver el detalle completo de un ticket, incluidas sus fechas de creación, última modificación y, si aplica, resolución.
- **FR-011**: El estado y la prioridad DEBEN distinguirse visualmente en el listado (por ejemplo, mediante etiquetas diferenciadas) sin depender únicamente del color.

**Edición y eliminación**

- **FR-012**: El sistema DEBE permitir editar título, descripción, categoría y prioridad de un ticket aplicando las mismas validaciones del registro (FR-002 a FR-005).
- **FR-013**: La edición NO DEBE modificar el identificador ni la fecha de creación, y DEBE actualizar la fecha de última modificación.
- **FR-014**: El sistema DEBE permitir cancelar una edición sin alterar el ticket.
- **FR-015**: El sistema DEBE solicitar confirmación antes de eliminar un ticket y, tras confirmarla, eliminarlo de forma permanente.

**Estados**

- **FR-016**: Cada ticket DEBE tener exactamente uno de los estados: Pendiente, En proceso o Resuelto.
- **FR-017**: El sistema DEBE permitir cambiar el estado de un ticket a cualquiera de los otros dos estados, incluida la reapertura de un ticket resuelto.
- **FR-018**: Al pasar a "Resuelto", el sistema DEBE registrar la fecha y hora de resolución; al salir de "Resuelto", DEBE eliminarla.

**Búsqueda y filtros**

- **FR-019**: El sistema DEBE permitir buscar tickets por texto contenido en el título o la descripción, sin distinguir mayúsculas, minúsculas ni tildes.
- **FR-020**: El sistema DEBE permitir filtrar tickets por estado, categoría y prioridad, de forma individual o combinada con la búsqueda.
- **FR-021**: El sistema DEBE mostrar el número de resultados, un mensaje cuando no haya coincidencias y una acción para limpiar todos los criterios.

**Estadísticas**

- **FR-022**: El sistema DEBE mostrar el total de tickets y la cantidad y porcentaje por estado.
- **FR-023**: El sistema DEBE mostrar la cantidad de tickets por categoría y por prioridad, con una representación visual comparativa.
- **FR-024**: Las estadísticas DEBEN calcularse sobre los datos actuales, reflejando cualquier alta, edición, cambio de estado o eliminación.

**Persistencia**

- **FR-025**: El sistema DEBE conservar todos los tickets y sus cambios de forma que estén disponibles al cerrar y volver a abrir la aplicación en el mismo equipo y navegador.
- **FR-026**: Cada operación de registro, edición, cambio de estado o eliminación DEBE conservarse en el momento en que el usuario la confirma, sin requerir una acción adicional de "guardar todo".
- **FR-027**: Si los datos conservados no pueden leerse o una operación no puede guardarse, el sistema DEBE informar al usuario con un mensaje claro y seguir funcionando.

### Key Entities *(include if feature involves data)*

- **Ticket**: Representa una incidencia informática. Atributos: identificador único, título, descripción, categoría, prioridad, estado, fecha de creación, fecha de última modificación y fecha de resolución (solo cuando está resuelto).
- **Categoría**: Clasificación del tipo de incidencia. Valores fijos: Hardware, Software, Red, Cuentas y accesos, Otro.
- **Prioridad**: Urgencia de atención. Valores ordenados: Baja, Media, Alta, Crítica.
- **Estado**: Etapa de seguimiento del ticket. Valores: Pendiente, En proceso, Resuelto.
- **Estadísticas**: Vista resumida calculada a partir de los tickets existentes (totales y distribución por estado, categoría y prioridad); no se almacena por separado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede registrar un ticket válido en menos de 1 minuto desde que abre el formulario.
- **SC-002**: El 100% de los intentos de guardar datos inválidos (campos vacíos, longitudes fuera de rango, categoría o prioridad no seleccionadas) son rechazados con un mensaje que identifica el campo y la regla.
- **SC-003**: El 100% de los tickets y cambios confirmados siguen disponibles, sin pérdida ni alteración, después de cerrar y volver a abrir la aplicación.
- **SC-004**: Con 500 tickets registrados, los resultados de búsqueda y filtros se muestran en menos de 1 segundo.
- **SC-005**: Un usuario localiza un ticket concreto entre 100 registros en menos de 15 segundos usando búsqueda o filtros.
- **SC-006**: Las cifras de las estadísticas coinciden al 100% con el recuento manual de los tickets existentes.
- **SC-007**: El cambio de estado de un ticket se completa en 2 acciones o menos desde el listado o el detalle.
- **SC-008**: Al menos el 90% de los usuarios de prueba completan sin ayuda las tareas de registrar, cambiar estado, buscar y eliminar un ticket en su primer intento.

## Assumptions

- La aplicación es de uso individual o compartido en un mismo equipo; no incluye inicio de sesión, roles, permisos ni asignación de tickets a técnicos concretos.
- Los datos se conservan localmente en el equipo y navegador donde se usa la aplicación; la sincronización entre dispositivos o usuarios queda fuera del alcance.
- Las listas de categorías y prioridades son fijas en esta versión; su administración por parte del usuario queda fuera del alcance.
- Los cambios de estado son libres entre los tres valores; no se exige un orden obligatorio, para permitir reabrir incidencias.
- La eliminación es permanente; no existe papelera ni recuperación de tickets eliminados.
- No se incluyen comentarios, archivos adjuntos, notificaciones ni historial detallado de cambios en esta versión.
- La interfaz se presenta en español y debe poder usarse en navegadores web actuales de escritorio y en pantallas móviles.
- El volumen esperado es de hasta unos pocos miles de tickets por equipo.
- La constitución del proyecto (`.specify/memory/constitution.md`) aún no está definida, por lo que esta especificación no se contrasta con principios propios del proyecto.

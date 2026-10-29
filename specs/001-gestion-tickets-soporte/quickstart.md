# Quickstart: validar la gestión de tickets

**Feature**: `001-gestion-tickets-soporte` | **Plan**: [plan.md](./plan.md)

Guía para ejecutar la aplicación y comprobar de extremo a extremo que cumple la [especificación](./spec.md). No contiene código de implementación.

## Requisitos previos

- Node.js 22 LTS y npm (`node --version`, `npm --version`).
- Navegador actual (Chrome, Edge, Firefox o Safari) con localStorage habilitado.

## Instalación y ejecución

```powershell
npm install
npm run dev        # servidor de desarrollo de Vite (http://localhost:5173)
npm test           # pruebas Vitest una vez
npm run test:watch # pruebas en modo observación
npm run coverage   # informe de cobertura
npm run build      # compilación de producción en dist/ (incluye comprobación de tipos)
npm run preview    # sirve dist/ para la validación final
```

## Escenarios de validación manual

| # | Escenario | Pasos | Resultado esperado |
| --- | --- | --- | --- |
| 1 | Registro válido (US1) | Nuevo ticket → título "Impresora no imprime", descripción ≥ 10 caracteres, Hardware, Alta → Guardar | Aparece primero en el listado con estado Pendiente, código `TK-0001` y aviso de confirmación. |
| 2 | Validaciones (US1) | Guardar con título "abc", descripción vacía, sin categoría ni prioridad | No se guarda; 4 mensajes junto a los campos; el texto escrito se conserva. |
| 3 | Persistencia (US1) | Crear 3 tickets, cerrar la pestaña, volver a abrir la URL | Los 3 tickets siguen con los mismos datos y estados. |
| 4 | Cambio de estado (US2) | Pasar un ticket a En proceso y luego a Resuelto; después reabrirlo a Pendiente | Etiqueta y fechas cambian; la fecha de resolución aparece y luego desaparece. |
| 5 | Edición (US3) | Editar prioridad y descripción → Guardar; repetir y Cancelar | Cambios guardados con nueva fecha de modificación; al cancelar no cambia nada. |
| 6 | Eliminación (US3) | Eliminar → Cancelar; Eliminar → Confirmar | Primero se conserva; después desaparece del listado, búsquedas y estadísticas, también tras recargar. |
| 7 | Búsqueda y filtros (US4) | Buscar "IMPRESORA" (en mayúsculas); buscar "configuracion" (sin tilde) teniendo un ticket "Error de configuración del correo"; combinar la búsqueda con estado Pendiente y categoría Hardware | Las búsquedas encuentran los tickets pese a mayúsculas y tildes; con filtros, solo aparecen los tickets que cumplen todo; se muestra el número de resultados; "Limpiar" restaura la lista. |
| 8 | Estadísticas (US5) | Con un conjunto conocido de tickets, abrir Estadísticas | Total, cantidades y porcentajes coinciden con el recuento manual; sin tickets todo aparece en 0. |
| 9 | Datos dañados (caso límite) | En DevTools → Application → Local Storage, cambiar el valor de `tickets-soporte:v1` por `{roto` y recargar | La app abre, avisa que los datos no se pudieron leer y sigue funcionando; existe una clave `...:backup-...`. |
| 10 | Responsive | Probar a 375 px, 768 px y 1280 px de ancho | Sin desplazamiento horizontal; tarjetas en móvil, tabla en escritorio; todos los controles utilizables. |

## Validación automatizada

- `npm test` debe terminar sin fallos.
- `npm run coverage` debe mostrar ≥ 90 % de líneas en `src/domain` y `src/storage`.
- `npm run build` debe terminar sin errores de TypeScript.
- Rendimiento (SC-004): la prueba de filtros con 500 tickets generados debe completarse en menos de 1 s.

Referencias: [modelo de datos](./data-model.md), [interfaces entre capas](./contracts/domain-api.md), [almacenamiento](./contracts/storage-schema.md), [rutas](./contracts/ui-routes.md).

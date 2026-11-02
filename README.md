# Sistema de Tickets de Soporte Técnico

SPA en español para registrar, consultar y dar seguimiento a incidencias de soporte. Permite cambiar estados, editar y eliminar tickets, buscar y filtrar la lista, y consultar estadísticas. Los datos se guardan en `localStorage`; la aplicación funciona sin backend ni cuentas de usuario.

## Requisitos

- Node.js 22 LTS y npm.
- Un navegador moderno con `localStorage` habilitado.

## Comandos

```powershell
npm install
npm run dev        # servidor de desarrollo
npm test           # pruebas automatizadas
npm run test:watch # pruebas en modo observación
npm run coverage   # cobertura de dominio y almacenamiento
npm run build      # comprobación TypeScript y compilación de producción
npm run preview    # vista previa de dist/
```

## Estructura

- `src/domain/`: tipos, validaciones, reglas de negocio, búsqueda y estadísticas; no accede al DOM ni al almacenamiento del navegador.
- `src/storage/`: repositorios de memoria y `localStorage`, con validación y respaldo de datos dañados.
- `src/ui/`: composición de la SPA, navegación, componentes y vistas.
- `src/styles/`: tokens, estilos base, diseño responsive y componentes.
- `tests/unit/`: pruebas del dominio y almacenamiento.
- `tests/integration/ui/`: pruebas de integración de las vistas con jsdom.
- `specs/001-gestion-tickets-soporte/`: especificación, diseño, contratos, quickstart y tareas de la funcionalidad.

## Datos de prueba

Al ejecutar `npm run dev`, la primera apertura en un navegador sin datos guardados carga 20 tickets ficticios: 8 pendientes, 6 en proceso y 6 resueltos. Incluyen las cinco categorías y las cuatro prioridades, con fechas de los veinte días anteriores a la carga.

Los tickets se guardan en `localStorage` y se pueden buscar, filtrar, editar, resolver y eliminar como cualquier otro registro. Las recargas conservan los cambios y no duplican los ejemplos. Si ya existe la clave `tickets-soporte:v1`, se conserva su contenido, incluso cuando la lista está vacía.

La carga automática solo se ejecuta en desarrollo; `npm run build` y `npm run preview` mantienen el inicio habitual sin generar ejemplos. Para probar desde cero sin alterar tus datos, usa un perfil de navegador distinto y abre la dirección que indique Vite. Los datos pertenecen a ese navegador y dirección.

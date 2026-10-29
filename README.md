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

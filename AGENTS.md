# Instrucciones del laboratorio

Proyecto: Sistema de Tickets de Soporte Técnico.
Ruta local: C:\Users\LENOVO\Documents\VScode\tickets-soporte.

## Alcance

El Paso 0 está preparado. Ejecutar una habilidad de Spec Kit solo cuando el usuario autorice esa etapa. No iniciar constitution, specify, plan, tasks, implement ni converge como consecuencia de una consulta de estado o una edición de documentación.

Las habilidades para Codex están en `.agents/skills/`. Seguir sus instrucciones cuando corresponda. Los prompts `$speckit-*` se invocan dentro de Codex.

## Bitácora centrada en Spec Kit

- Mantener `docs/bitacora-laboratorio.md` breve y centrada en el flujo de GitHub Spec Kit.
- El Paso 0 documenta `specify init tickets-soporte --integration codex`, la opción PowerShell, los archivos que generó y la comprobación de la integración.
- En cada etapa autorizada, anotar la fecha, el comando o prompt realmente ejecutado, los archivos generados o modificados y un resumen del resultado. Incluir solo la salida relevante.
- Mantener las secciones Paso 0, Specify, Plan, Tasks, Implement, Converge, Problemas y Conclusiones. Distinguir las etapas ejecutadas de las pendientes.
- Registrar en la bitácora únicamente los problemas que afecten al flujo de Spec Kit y su solución.
- Conservar las instalaciones de Windows, inspecciones, permisos, autenticación, reintentos, comandos de Git y salidas extensas en `.lab-logs/`. No incorporarlos automáticamente a la bitácora principal.
- Usar `scripts/Invoke-LabCommand.ps1` para el registro técnico local. El script ya no modifica la bitácora pública; actualizar el resumen de la etapa directamente.
- Al terminar una etapa autorizada, publicar los cambios y su resumen mediante un commit descriptivo. Conservar el resultado del commit y push en los registros locales.

## Entorno local

Trabajar en Windows y PowerShell. Ejecutar `scripts/Enter-Lab.ps1` al abrir una sesión para cargar las herramientas existentes. Mantener el repositorio directamente en la ruta indicada y conservar los demás proyectos de VScode.

Los transcript, respaldos y rutas locales están en `.lab-logs/`, excluida de Git. No publicar credenciales, códigos de acceso, cookies, claves privadas ni correos de compañeros. No reinstalar herramientas presentes ni imprimir credenciales.

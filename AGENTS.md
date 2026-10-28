# Instrucciones del laboratorio

Este repositorio corresponde al laboratorio Sistema de Tickets de Soporte Técnico.

Ruta local actual: C:\Users\LENOVO\Documents\VScode\tickets-soporte.

## Alcance autorizado

El Paso 0 prepara herramientas, Spec Kit, Codex y GitHub. No ejecutar `$speckit-specify`, `$speckit-plan`, `$speckit-tasks`, `$speckit-implement` ni `$speckit-converge` hasta que el usuario autorice la etapa correspondiente.

## Registro continuo

- Antes de ejecutar comandos, registrar fecha y hora de Lima, directorio, comando exacto, objetivo, resultado relevante, estado y solución de errores en `docs/bitacora-laboratorio.md`.
- Para comandos de PowerShell, usar `scripts/Invoke-LabCommand.ps1`, que registra la ejecución y su resultado inmediatamente. Usar números de registro consecutivos. Los fallos y reintentos también se registran.
- Para herramientas internas, API, navegador y prompts de Codex, añadir una entrada equivalente al terminar cada acción. Incluir parámetros no sensibles y los archivos realmente generados o modificados.
- Conservar transcript y respaldos completos en `.lab-logs/`, excluida de Git. No publicar tokens, códigos de acceso, contraseñas, cookies, claves privadas ni correos de compañeros. Nunca ejecutar comandos que impriman credenciales. Usar `-PublicCommand` o `-RedactOutput` cuando el registro público necesite omitir datos personales.
- Mantener las secciones Paso 0, Specify, Plan, Tasks, Implement, Converge, Problemas y Conclusiones. Diferenciar lo ejecutado, lo verificado y lo pendiente.
- Al finalizar una etapa autorizada, revisar los archivos preparados, comprobar que no incluyan datos sensibles y publicar los cambios junto con la documentación mediante commits descriptivos.
- El resultado del último commit y push de la propia bitácora queda en el transcript local; incorporarlo a Markdown en la siguiente intervención para evitar un ciclo infinito de commits de cierre. No presentar una publicación como exitosa hasta comprobarla.

## Trabajo local

Trabajar en Windows y PowerShell. Conservar los demas proyectos de la carpeta VScode. No sobrescribir trabajo existente ni crear otro repositorio para este laboratorio. Cuando Git MSYS2 falle en este equipo, usar `C:\Program Files\Git\cmd\git.exe`.

Al abrir una nueva sesión, ejecutar `scripts/Enter-Lab.ps1` mediante el registrador. Carga el PATH y los directorios de uv de esta instalación sin modificar la configuración global. Las rutas locales están en `.lab-logs/tool-paths.json`, excluido de Git. No reinstalar herramientas que ya estén presentes.

Las habilidades de Spec Kit para Codex están en `.agents/skills/`. Seguir las instrucciones de la habilidad correspondiente cuando el usuario autorice una etapa.

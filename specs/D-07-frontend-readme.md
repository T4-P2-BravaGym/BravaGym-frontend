# D-07 · README frontend de entrega

Issue: T4-P2-BravaGym/BravaGym-backend#283 · Parent: #200 · Entrega 2 · Tamaño S

## Contexto

Como equipo queremos que la profesora pueda instalar y recorrer el frontend completo y localizar los documentos de entrega.

## Requisitos

1. Explicar instalación reproducible, variables públicas, conexión a la API, cuentas ficticias, áreas por rol, tests y build/preview existentes.
2. Enlazar el README backend para instalación Python, Alembic y seed, y enlazar Swagger, ReDoc, Bruno, specs, bitácora y ER.
3. Mostrar el estado real de Docker, retrospectiva y URL pública, actualizables cuando se publiquen.
4. Conservar las instrucciones vigentes de sesión, estilos y Vitest; corregir referencias obsoletas a rutas sin protección y lockfile inexistente.

## Criterios de aceptación

- Dado el repositorio y sus dependencias, cuando se ejecutan los comandos de calidad existentes, entonces lint, tests y build pasan.
- Dadas las rutas documentadas, cuando se contrastan con paths.js y AppRouter.jsx, entonces coinciden sus áreas y roles.
- Dado el índice de entrega, cuando se consulta, entonces enlaza los recursos existentes y señala los pendientes sin inventar URLs.

## Fuera de alcance

Cambiar código, dependencias o tests; integrar ramas todavía en revisión; implementar Docker, desplegar o redactar la retrospectiva del equipo.

## Preguntas abiertas

Docker (#112/#115), retrospectiva (#200) y URLs públicas (#185) se completarán en sus tareas.

## Decisiones

| Decisión | Por qué |
| --- | --- |
| Rama desde dev | Documentar el estado integrado, sin incluir HU-35 aún en revisión. |
| npm ci y Node 22 | Coincidir con el lockfile y CI existentes. |
| Enlaces al backend | Mantener una sola referencia para instalación Python, Alembic, seed y documentos comunes. |

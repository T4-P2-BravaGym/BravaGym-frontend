# T-10 · Unificar los tests de sesión en Vitest

Seguimiento de T-10 y HU-33, después de integrar la PR #81.

## Contexto

Los tests del frontend usan Vitest, pero HU-33 conserva quince casos ejecutados con Node. Se migran al entorno ya integrado por el equipo para tener un solo runner.

## Requisitos

1. Conservar los quince casos y sus comprobaciones de renovación, reintento, cookies, cierre y carreras de sesión.
2. Ejecutarlos con Vitest junto a los tests existentes, con imports directos y sin iniciar otro servidor Vite.
3. Restaurar fetch y la configuración compartida entre casos para evitar dependencias del orden de ejecución.
4. `npm test` ejecuta toda la suite una vez; `npm run test:watch` incluye también sesión. CI sigue usando `npm test`.
5. Actualizar README y registrar la ayuda de IA en la bitácora compartida del backend.

## Criterios de aceptación

- Dada la suite anterior, cuando se migra, entonces siguen existiendo y pasando los quince escenarios de HU-33.
- Dados los tests de Damaris, cuando se ejecuta `npm test`, entonces pasan junto a sesión sin un segundo runner.
- Dada la renovación o el logout incorrectos, cuando se ejecutan las pruebas de regresión correspondientes, entonces detectan el error.
- Dado el frontend, cuando se ejecutan lint y build, entonces no aparecen errores nuevos.

## Interfaz

Sin cambios en la interfaz ni en la lógica de producción.

## Fuera de alcance

- Añadir funciones de autenticación, cambiar contratos de la API o modificar los tests funcionales de otras áreas.

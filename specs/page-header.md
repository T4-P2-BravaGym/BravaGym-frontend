# PageHeader común

Issue: #49 · Entrega 2 · Tamaño S

## Contexto

> Como equipo queremos una sola cabecera de página para que todas se vean igual y no repetir el
> mismo marcado y los mismos estilos en cada página.

Doce páginas repiten a mano la cabecera (antetítulo, título y entradilla), cada una con sus
estilos en su `.module.scss`, y ya no coinciden: `AdminUsers` y `AdminCancellations` usan el
tamaño de título por defecto, y el ancho del texto cambia de una página a otra. La tarea nombraba
siete; al revisar `dev` salieron cinco más: `AdminCancellations`, `AdminDiscountCodes`,
`AdminPayments`, `Cart` y `MyPayments`.

## Requisitos

1. Un componente `PageHeader` en `components/ui` pinta la cabecera: antetítulo, título como `<h1>` y entradilla, con una acción opcional.
2. Usa los mixins `eyebrow` y `display-text` (40 px; 32 px en móvil) y solo tokens.
3. Las doce páginas lo usan y sus `.module.scss` ya no tienen `.eyebrow`, `.title` ni `.lead` de la cabecera.
4. Tiene ficha y demo en el Sandbox.

## Criterios de aceptación

- **Dado** cualquiera de las doce páginas, **cuando** la abro, **entonces** la cabecera tiene el mismo tamaño de título, espaciado y colores en escritorio y en móvil.
- **Dado** `PageHeader` con una acción (por ejemplo "Nueva clase"), **cuando** lo veo en escritorio, **entonces** el botón queda a la derecha; en móvil, debajo del texto.
- **Dado** el Sandbox, **cuando** lo abro, **entonces** `PageHeader` aparece con su ficha y su demo.
- **Dado** cualquier página que lo use, **cuando** reviso su `.module.scss`, **entonces** ya no tiene las clases `.eyebrow`, `.title` ni `.lead` de la cabecera.
- **Dado** `npm test`, **entonces** pasan los tests de `PageHeader` (título como `<h1>`, acción dentro de la cabecera, solo título si no hay más).

## Interfaz

- `PageHeader({ title, eyebrow, lead, action })`: `title` es obligatorio; el resto, opcional.
- El texto mide como mucho 40rem. `action` es un nodo (normalmente un `Button`).
- Los filtros de Tienda y Horario no entran en `PageHeader`: se quedan en la página, debajo.

## Fuera de alcance

- `Login` y `Register` (cabecera dentro de la tarjeta del formulario, con otro tamaño).
- `MemberHome` y las páginas que solo tienen un `<h1>`.
- El espacio entre la cabecera y el contenido, que marca el `.root` de cada página.
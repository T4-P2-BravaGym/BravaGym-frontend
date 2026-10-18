# WeekNav común

Issue: F#88 · Entrega 2 · Tamaño S

## Contexto

> Como equipo queremos una sola navegación por semanas para no repetir el mismo marcado,
> la misma lógica y los mismos estilos en cada horario.

Cuatro páginas (`Schedule`, `Bookings`, `PersonalTraining` y `TrainerSessions`) copian la
navegación por semanas: los dos botones con flecha, el texto de la semana, el cálculo del salto
de 7 días y los estilos `.weekNav` y `.weekLabel`. Salió al cambiar "Anterior" y "Siguiente" por
flechas, que hubo que hacer cuatro veces.

## Requisitos

1. Un componente `WeekNav` en `components/domain` con las flechas, la semana en medio y el salto de una semana.
2. La página guarda la fecha en su estado; `WeekNav` solo la mueve.
3. Las cuatro páginas lo usan y sus `.module.scss` ya no tienen `.weekNav` ni `.weekLabel`.
4. Tiene ficha y demo en el Sandbox.

## Criterios de aceptación

- **Dado** cualquiera de los cuatro horarios, **cuando** pulso una flecha, **entonces** veo la semana anterior o la siguiente, igual que antes.
- **Dado** un lector de pantalla, **cuando** llega a las flechas, **entonces** lee "Semana anterior" y "Semana siguiente", y anuncia la semana nueva al cambiar.
- **Dado** un móvil, **cuando** veo la navegación, **entonces** las flechas y la semana caben en una línea.
- **Dado** `npm test`, **entonces** pasan los tests de `WeekNav` (texto de la semana y salto de 7 días hacia atrás y hacia delante).

## Interfaz

- `WeekNav({ anchor, onChange })`: `anchor` es una fecha de la semana que se ve; `onChange` recibe la fecha de la semana nueva.

## Fuera de alcance

- Cambiar cómo se calculan las semanas (`utils/week.js`) o cómo cargan las clases las páginas.
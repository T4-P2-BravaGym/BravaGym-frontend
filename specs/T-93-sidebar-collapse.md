# T-93 · Menú lateral que se puede contraer

Issue: #93 · Entrega 2 · Tamaño S

## Contexto

Toca el menú lateral de las áreas privadas (socia, entrenadora y administración), que es el
mismo componente `SideNav` para todos los roles. En un ordenador ocupa 248 px siempre. La issue
pide poder contraerlo, como opción: por defecto se ve como hasta ahora.

## Requisitos

1. En un ordenador, un botón contrae el menú para que solo se vean los iconos, y el mismo botón lo vuelve a abrir.
2. Contraído, cada enlace sigue teniendo su nombre: se ve al pasar el ratón y lo lee el lector de pantalla.
3. El navegador recuerda la elección: al recargar o volver otro día, el menú sale como lo dejó.
4. Por defecto el menú sale abierto.
5. En el móvil no cambia nada: sigue su propio botón "Menú".

## Criterios de aceptación

- **Dado** el menú abierto en un ordenador, **cuando** pulso el botón de contraer, **entonces** el menú se estrecha, solo se ven los iconos y el contenido gana el espacio.
- **Dado** el menú contraído, **cuando** paso el ratón por un icono, **entonces** veo el nombre del enlace.
- **Dado** el menú contraído, **cuando** pulso el botón otra vez, **entonces** vuelve a abrirse.
- **Dado** que uso el teclado, **cuando** llego al botón con Tab, **entonces** se ve el foco, Enter o Espacio lo cambian y el lector anuncia si está pulsado.
- **Dado** que contraje el menú, **cuando** recargo la página, **entonces** sigue contraído.
- **Dado** el carrito con productos, **cuando** el menú está contraído, **entonces** el número sigue viéndose sobre el icono.
- **Dado** el ancho de un móvil, **entonces** no aparece el botón de contraer y el menú funciona como antes.

## Interfaz

- `SideNav` recibe `collapsed` y `onToggleCollapsed`. Contraído enseña los iconos de
  `routes/navigation.js` con el nombre como `title` y como texto oculto, el logo como "b." y,
  abajo, el avatar y un icono para salir.
- `PrivateLayout` guarda la elección en `localStorage` y estrecha su columna a 76 px.
- Sin estados nuevos.

## Fuera de alcance

- Contraer el menú en el móvil: ya tiene su propio menú desplegable.
- Guardar la preferencia en la cuenta (servidor): es una comodidad de cada navegador.

## Decisiones

| Decisión | Por qué |
| --- | --- |
| Contraído se ven los iconos que ya tenía `routes/navigation.js` | El diseño no tiene una versión contraída; es el patrón habitual y no hace falta inventar iconos. |
| El nombre del enlace queda como texto oculto y como `title` | El lector de pantalla lo sigue leyendo y con el ratón se ve al pasar por encima. |
| El botón tiene un nombre fijo ("Contraer menú") y el estado va en `aria-pressed` | Igual que el ojo de la contraseña (#75): no se anuncia dos veces. |
| La elección se guarda en `localStorage`, con `try/catch` | Es una comodidad de cada navegador, no un dato de la cuenta; si el almacenamiento está bloqueado, el menú funciona igual. |
| Todo lo contraído va dentro de una media query de ordenador | En el móvil el menú es otro (botón "Menú") y no debe cambiar. |
| `PrivateLayout` guarda el estado y `SideNav` solo lo pinta | El layout es quien decide el ancho de la columna. |
# T-75 · Mostrar u ocultar la contraseña

Issue: #75 · Entrega 2 · Tamaño S

## Contexto

> Como usuaria quiero ver lo que escribo en un campo de contraseña para no equivocarme.

Toca los formularios del frontend. Los campos de contraseña solo enseñan puntos y no hay forma
de comprobar lo escrito, ni en el login ni en el registro. Salió al hacer "Cambiar contraseña"
(HU-32). Es una mejora de `Field`, el componente que usan todos los formularios.

## Requisitos

1. Un campo de contraseña puede llevar un botón de ojo para ver lo escrito y volver a ocultarlo.
2. El botón se usa con ratón, con el dedo y con el teclado, y un lector de pantalla sabe qué hace y si está activado.
3. Se usa en el login y en el registro, y en "Cambiar contraseña" cuando la HU-32 esté en `dev`.
4. Los demás campos de la app no cambian.

## Criterios de aceptación

- **Dado** un campo de contraseña con ojo, **cuando** pulso el botón, **entonces** veo el texto; y si lo pulso otra vez, vuelvo a ver puntos.
- **Dado** que uso el teclado, **cuando** llego al botón con Tab y pulso Enter o Espacio, **entonces** cambia igual, y el foco se ve.
- **Dado** un lector de pantalla, **cuando** llega al botón, **entonces** lee "Mostrar contraseña" y si está pulsado o no.
- **Dado** un campo desactivado (por ejemplo, mientras se guarda), **entonces** el botón también está desactivado.
- **Dado** cualquier otro `Field` (texto, email, select, textarea), **entonces** se ve y funciona igual que antes.

## Interfaz

- `Field` acepta una prop nueva, `revealable`, que solo hace algo en `type="password"`: añade un
  botón con un icono de ojo dentro del campo, a la derecha.
- Dos iconos nuevos en `Icon`: `eye` y `eyeOff`.
- Login y Register usan `revealable` en su campo de contraseña.
- Sin estados nuevos: carga y error siguen como estaban en cada formulario.

## Fuera de alcance

- "Cambiar contraseña" (HU-32): se añade cuando su PR esté en `dev`, con una línea por campo.
- Medir la fuerza de la contraseña.
- Ocultar el texto otra vez solo al enviar el formulario.
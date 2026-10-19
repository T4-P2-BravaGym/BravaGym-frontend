# T-101 · Mi perfil y contraseña para entrenadoras y administración

Issue: #101 · Entrega 2 · Tamaño S

## Contexto

> Como entrenadora o administradora quiero cambiar mis datos y mi contraseña desde la app, igual que una socia.

"Mi perfil" (datos, HU-04, y "Cambiar contraseña", HU-32) solo estaba en el área de socia,
aunque la API deja hacerlo a cualquier rol. Se vio al hacer la HU-32. Solo toca el frontend.

## Requisitos

1. Una entrenadora ve en "Mi perfil y cuenta", debajo de lo que ven las socias, una sección "Mi cuenta" con sus datos y el cambio de contraseña.
2. Administración y superadmin tienen "Mi cuenta" en su menú, con sus datos y el cambio de contraseña.
3. Los formularios son los mismos para todos los roles: mismos campos, mensajes y comportamiento (tras cambiar la contraseña, vuelve a entrar).
4. "Mi perfil" de la socia sigue funcionando igual.

## Criterios de aceptación

- **Dado** que soy entrenadora, **cuando** abro "Mi perfil y cuenta", **entonces** veo mi tarjeta pública y, debajo, "Mi cuenta" con "Mis datos" y "Cambiar contraseña".
- **Dado** que soy admin o superadmin, **cuando** abro "Mi cuenta" (`/admin/cuenta`), **entonces** veo "Mis datos" y "Cambiar contraseña".
- **Dado** cualquier rol, **cuando** guardo mis datos, **entonces** veo "Tus datos se han guardado."
- **Dado** cualquier rol, **cuando** cambio mi contraseña, **entonces** se cierra la sesión y el login me lo dice.
- **Dado** que soy socia, **cuando** abro "Mi perfil", **entonces** veo lo mismo que antes.

## Interfaz

- Nuevo bloque compartido `pages/shared/Account`: `MyDataForm` ("Mis datos") y `ChangePasswordForm` (movido desde la socia), juntos en `AccountSections`.
- Socia: "Mi perfil" usa `PageHeader` y `AccountSections`.
- Entrenadora: el menú pasa a "Mi perfil y cuenta"; la página empieza por la tarjeta "Mi perfil público" y debajo aparece la sección "Mi cuenta" ("Solo tú ves estos datos.") con `AccountSections`.
- Administración: nueva página "Mi cuenta" en `/admin/cuenta`, con `PageHeader` y `AccountSections`.

## Fuera de alcance

- Que administración cambie los datos o la contraseña de otra persona (HU-31 lo excluye para la contraseña).
- Recuperar la contraseña olvidada (HU-35).

## Decisiones

| Decisión | Por qué |
| --- | --- |
| "Mis datos" y "Cambiar contraseña" en `pages/shared/Account`, usados por las tres áreas | Los mismos formularios para todos los roles (DRY). Van en `pages` y no en `components` porque llaman a la API. |
| La entrenadora lo tiene en la misma página que su perfil público, bajo el título "Mi cuenta" | No hace falta otra entrada de menú; el título y "Solo tú ves estos datos." separan lo público de lo privado. |
| El menú de la entrenadora pasa a "Mi perfil y cuenta" | Dice las dos cosas y cabe en una línea del menú lateral. |
| Administración tiene una página propia, "Mi cuenta" (`/admin/cuenta`) | No tiene perfil público; una ruta dentro de su área reutiliza la protección y el menú que ya existen. |
| Sin cambios en el backend | `PATCH /users/me` y `POST /users/me/password` ya aceptaban cualquier rol. |
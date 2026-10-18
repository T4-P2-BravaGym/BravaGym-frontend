# T-101 · Mi perfil y contraseña para entrenadoras y administración

Issue:#101 · Entrega 2 · Tamaño S

## Contexto

> Como entrenadora o administradora quiero cambiar mis datos y mi contraseña desde la app, igual que una socia.

"Mi perfil" (datos, HU-04, y "Cambiar contraseña", HU-32) solo estaba en el área de socia,
aunque la API deja hacerlo a cualquier rol. Se vio al hacer la HU-32. Solo toca el frontend.

## Requisitos

1. Una entrenadora ve en "Mi perfil público", debajo de lo que ven las socias, una sección "Mi cuenta" con sus datos y el cambio de contraseña.
2. Administración y superadmin tienen "Mi cuenta" en su menú, con sus datos y el cambio de contraseña.
3. Los formularios son los mismos para todos los roles: mismos campos, mensajes y comportamiento (tras cambiar la contraseña, vuelve a entrar).
4. "Mi perfil" de la socia sigue funcionando igual.

## Criterios de aceptación

- **Dado** que soy entrenadora, **cuando** abro "Mi perfil público", **entonces** veo mi tarjeta pública y, debajo, "Mi cuenta" con "Mis datos" y "Cambiar contraseña".
- **Dado** que soy admin o superadmin, **cuando** abro "Mi cuenta" (`/admin/cuenta`), **entonces** veo "Mis datos" y "Cambiar contraseña".
- **Dado** cualquier rol, **cuando** guardo mis datos, **entonces** veo "Tus datos se han guardado."
- **Dado** cualquier rol, **cuando** cambio mi contraseña, **entonces** se cierra la sesión y el login me lo dice.
- **Dado** que soy socia, **cuando** abro "Mi perfil", **entonces** veo lo mismo que antes.

## Interfaz

- Nuevo bloque compartido `pages/shared/Account`: `MyDataForm` ("Mis datos") y `ChangePasswordForm` (movido desde la socia), juntos en `AccountSections`.
- Socia: "Mi perfil" usa `PageHeader` y `AccountSections`.
- Entrenadora: "Mi perfil público" no cambia de nombre; debajo de la tarjeta pública aparece la sección "Mi cuenta" ("Solo tú ves estos datos.") con `AccountSections`.
- Administración: nueva página "Mi cuenta" en `/admin/cuenta`, con `PageHeader` y `AccountSections`.

## Fuera de alcance

- Que administración cambie los datos o la contraseña de otra persona (HU-31 lo excluye para la contraseña).
- Recuperar la contraseña olvidada (HU-35).
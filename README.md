# Brava · Web

Web de Brava, gimnasio de fuerza para mujeres: web pública, área de socia, panel de entrenadora y panel de administración.

**Stack:** React 19 con JavaScript, Vite, React Router y SASS (CSS Modules). Los estilos salen del sistema de diseño de Brava (`src/styles/_tokens.scss`).

## Documentación de entrega

Esta guía cubre el frontend completo del equipo, tarea [#283](https://github.com/T4-P2-BravaGym/BravaGym-backend/issues/283), dentro de [D-07 · #200](https://github.com/T4-P2-BravaGym/BravaGym-backend/issues/200). El [README del backend](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/README.md) mantiene la instalación de Python, Alembic, seed y uso de la API.

| Recurso | Enlace |
| --- | --- |
| Web local | [http://localhost:5173](http://localhost:5173) |
| Swagger de la API local | [http://localhost:8000/docs](http://localhost:8000/docs) |
| ReDoc de la API local | [http://localhost:8000/redoc](http://localhost:8000/redoc) |
| Colección de Bruno | [Backend: `collections/brava/`](https://github.com/T4-P2-BravaGym/BravaGym-backend/tree/dev/collections/brava) |
| Specs compartidas | [Backend: `specs/`](https://github.com/T4-P2-BravaGym/BravaGym-backend/tree/dev/specs) |
| Spec de esta documentación | [`specs/D-07-frontend-readme.md`](specs/D-07-frontend-readme.md) |
| Bitácora de IA común | [Backend: `docs/ai-log.md`](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/docs/ai-log.md) |
| Modelo entidad-relación | [Backend: `docs/er.md`](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/docs/er.md) |
| Reglas de negocio y permisos | [Reglas](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/docs/business-rules.md) y [API](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/docs/api.md) |
| Retrospectiva | Pendiente de publicación y enlace en [#200](https://github.com/T4-P2-BravaGym/BravaGym-backend/issues/200) |
| URL desplegada del frontend | Pendiente de confirmación en [HU-36 · #185](https://github.com/T4-P2-BravaGym/BravaGym-backend/issues/185) |

Los enlaces `localhost` requieren los servidores locales arrancados. La retrospectiva y las URLs públicas se actualizarán cuando el equipo las publique; no están confirmadas en `dev`.

## Arrancar en local

Requisitos: Git, Node.js **22.12 o posterior de la rama 22** (CI usa Node 22), npm y la API local. El lockfile ya está versionado: `npm ci` instala sus versiones sin regenerarlo.

```bash
git clone https://github.com/T4-P2-BravaGym/BravaGym-frontend.git
cd BravaGym-frontend
git switch dev
npm ci
cp .env.example .env
npm run dev                 # http://localhost:5173
```

Si ya tienes el repositorio, empieza desde su raíz, sin repetir el clone. Detén Vite con `Ctrl+C`; ejecuta los controles en otra terminal.

### Conectar con la API y preparar la demo

1. Sigue el [README backend](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/dev/README.md): crear el entorno Python, instalar dependencias y configurar `.env` con una clave privada.
2. Desde la raíz del backend, con ese entorno activado, ejecuta `alembic upgrade head`. Para una base local vacía, ejecuta también `python -m scripts.seed` con `ENVIRONMENT=local`.
3. Arranca la API con `uvicorn app.main:app --reload`; [health](http://localhost:8000/health) debe responder y [Swagger](http://localhost:8000/docs) debe abrirse.
4. En el `.env` del frontend deja `VITE_API_URL=http://localhost:8000/api/v1` y `VITE_DEV_SKIP_AUTH=false`. El backend debe permitir `CORS_ORIGINS=["http://localhost:5173"]`.
5. Arranca Vite y abre `/entrar`. Usa una cuenta ficticia del seed, según el rol que quieras probar.

| Rol | Email de demostración | Área inicial |
| --- | --- | --- |
| Socia | `lucia@example.com`, `carmen@example.com` | `/mi-area` |
| Entrenadora | `ana@example.com`, `marta@example.com` | `/entrenadora/clases` |
| Administración | `admin@example.com` | `/admin` |
| Superadministración | `superadmin@example.com` | `/admin` y área de entrenadora |

La contraseña ficticia por defecto del seed es `BravaDemo2026!`; si se configuró `SEED_PASSWORD`, usa ese valor de demostración. No son cuentas de producción. El seed no se repite sobre una base con datos; consulta la preparación de base temporal en el README backend.

### Variables públicas

[`.env.example`](.env.example) es la referencia. Toda variable `VITE_*` acaba en el navegador: nunca añadas claves privadas, contraseñas ni secretos del backend.

- `VITE_API_URL`: URL base con `/api/v1`, sin barra final. Si cambias el puerto de la API, actualízala y reinicia Vite.
- `VITE_DEV_SKIP_AUTH`: debe quedar en `false` para probar sesiones y permisos. `true` permite inspeccionar las páginas privadas solo en desarrollo; no crea una sesión ni evita los permisos de la API, y se ignora al compilar.

Usa el mismo hostname en ambos servidores (`localhost` en los ejemplos). Si Vite elige otro puerto por estar ocupado el 5173, libera el puerto o actualiza CORS para el origen que muestre Vite.

## Uso por áreas

Las rutas reales se mantienen en [`src/routes/paths.js`](src/routes/paths.js) y sus permisos en [`src/routes/AppRouter.jsx`](src/routes/AppRouter.jsx).

| Área | Pantallas y funciones |
| --- | --- |
| Pública | Inicio `/`, clases `/clases`, entrenadoras `/entrenadoras`, planes `/precios`, tienda `/tienda`, registro `/registro` y login `/entrar` |
| Socia | Resumen `/mi-area`, reservas `/mi-area/reservas`, entrenamiento personal `/mi-area/entrenamiento-personal`, rutina `/mi-area/rutina`, pagos `/mi-area/pagos`, carrito `/mi-area/carrito` y perfil `/mi-area/perfil` |
| Entrenadora y superadministración | Clases `/entrenadora/clases`, franjas `/entrenadora/franjas`, rutinas `/entrenadora/rutinas` y perfil `/entrenadora/perfil` |
| Administración y superadministración | Resumen `/admin`, pagos `/admin/pagos`, bajas `/admin/bajas`, códigos `/admin/codigos`, usuarias `/admin/usuarias`, planes `/admin/planes` y productos `/admin/productos` |
| Equipo | Catálogo de componentes `/sandbox` |

Sin sesión, las rutas privadas redirigen al login. Con un rol sin permiso se muestra un estado de acceso denegado. La API sigue siendo quien autoriza cada operación.

Para una demo, inicia sesión como socia y recorre reservas, rutina, perfil y tienda/carrito; después cierra sesión y usa las cuentas de entrenadora o administración para sus paneles. Los pagos actuales son simulados: no se presenta el flujo como un cobro real de Stripe. Las pantallas que dependen de datos necesitan el backend y el seed.

## Compilar y previsualizar

```bash
npm run lint
npm test
npm run build               # genera dist/
npm run preview             # normalmente http://localhost:4173
```

La previsualización necesita la API igual que el desarrollo. Añade `http://localhost:4173` a `CORS_ORIGINS` del backend para probarla y reinicia la API; conserva el origen 5173 si sigues usando Vite. `VITE_API_URL` se incorpora al compilar: si cambia, repite `npm run build`. `npm run preview` sirve para comprobar el build localmente, no para alojar producción.

Al publicar `dist/`, el hosting debe devolver `index.html` para rutas de React Router (por ejemplo, al recargar `/mi-area/reservas`). El navegador necesita una API accesible y la configuración de cookies/orígenes descrita abajo.

## Docker y despliegue

Docker se coordina en [HU-27 · #112](https://github.com/T4-P2-BravaGym/BravaGym-backend/issues/112) y su documentación en [#115](https://github.com/T4-P2-BravaGym/BravaGym-backend/issues/115). `dev` todavía no contiene un Dockerfile ni Compose; las instrucciones verificables por ahora son las locales. La base SQLite y `media/` necesitan persistencia en el backend.

La URL pública y la configuración final se incorporarán al completar [HU-36 · #185](https://github.com/T4-P2-BravaGym/BravaGym-backend/issues/185). No se añade un despliegue ni infraestructura en esta tarea de documentación.

## Sesión y renovación automática (HU-33)

Requiere el backend de HU-33 con su migración aplicada. La spec compartida está en `specs/HU-33-refresh-logout.md` del backend ([issue #182](https://github.com/T4-P2-BravaGym/BravaGym-backend/issues/182)); el uso de Codex se registra en su `docs/ai-log.md`.

El access token vive solo en memoria. El refresh lo guarda el navegador en una cookie HttpOnly del backend: JavaScript no lo lee ni lo escribe. Al iniciar la app se intenta recuperar la sesión con esa cookie; las rutas privadas esperan hasta que termina. Se elimina el antiguo `brava.token` de localStorage.

Si una petición autenticada devuelve 401, se renueva la sesión una vez y se reintenta una vez, también en las descargas. Las peticiones simultáneas de esta página comparten la misma renovación. La caducidad del access intenta renovar en lugar de cerrar inmediatamente. Logout espera una renovación en curso para revocar el par nuevo y evita que una respuesta tardía restaure la sesión. Una petición anterior no se repite bajo un login diferente.

Login, refresh y logout usan `credentials: include`; refresh/logout envían `X-Brava-CSRF: 1`. En local usa el mismo nombre de host en ambos lados (por ejemplo, frontend `http://localhost:5173` y API `http://localhost:8000/api/v1`), con el origen del frontend en CORS. No mezcles `localhost` y `127.0.0.1`. La cookie usa SameSite=Lax y Secure fuera de local; el contrato de producción requiere HTTPS y frontend/API en el mismo sitio (mismo esquema y dominio registrable). Configura `VITE_API_URL` con la URL real de la API y CORS con el origen exacto del frontend. El despliegue entre sitios diferentes requiere una revisión específica; no está soportado por esta configuración.

HttpOnly reduce la exposición del refresh a JavaScript, pero un XSS todavía puede ejecutar acciones y acceder al access en uso. La protección de origen/CSRF y HTTPS siguen siendo necesarias. La coordinación de renovaciones es por página; varias pestañas pueden competir por la misma cookie y una de ellas necesitar iniciar sesión otra vez.

Si el servidor no confirma logout, se borra la sesión de esta página y se muestra un aviso en login con un botón para reintentar. No se presenta el borrado local como una revocación confirmada.

Comprobaciones: `npm test` (Vitest, incluidos los quince casos de sesión de HU-33), `npm run build` y `npm run lint`. Se comprobaron manualmente login, recarga conservando sesión y logout sin restauración al recargar. El flujo de servicios también se verificó contra una API real con SQLite temporal.

## Tests (T-10)

Vitest con Testing Library y jsdom. Cada test va junto al archivo que prueba (`ProductCard.test.jsx` al lado de `ProductCard.jsx`).

```bash
npm test                    # todos los tests, una vez (lo mismo que la CI)
npm run test:watch          # vuelve a pasar los tests al guardar
```

- Los tests se ejecutan con la hora de Madrid (`TZ` en `vite.config.js`), así en local y en GitHub Actions salen igual.
- Se prueba lo que ve y hace la usuaria: se buscan los elementos por su rol y su texto (`getByRole`, `getByLabelText`), no por clases.
- `useAuth` y `fetch` se simulan con `vi.mock` y `vi.stubGlobal`: los tests no necesitan la API.
- `build.yml` ejecuta `npm test` en cada PR y falla si falla un test.
- Los quince casos de sesión de HU-33 viven en `src/services/session.test.js` y usan el mismo Vitest; no se inicia un servidor Vite adicional ni se ejecuta otro runner.

## Estructura

```
src/
  components/ui/       # piezas del sistema de diseño: Button, Badge, Chip, Field, Card…
  components/domain/   # piezas de Brava: SessionCard, WeekSchedule, PricingCard…
  components/layout/   # Navbar, Footer, SideNav, MobileTabBar
  layouts/             # PublicLayout y PrivateLayout
  pages/               # una carpeta por pantalla: public/, member/, trainer/, admin/
  routes/              # AppRouter, ProtectedRoute y paths.js
  context/ hooks/      # sesión (AuthContext, useAuth)
  services/            # llamadas a la API (api.js es el único cliente HTTP)
  utils/               # formato de euros y fechas
  styles/              # tokens, mixins y estilos globales
```

Las páginas se organizan por área y reutilizan los componentes UI y de dominio. `ProtectedRoute` comprueba la sesión y el rol; el acceso visual de desarrollo solo se habilita explícitamente con `VITE_DEV_SKIP_AUTH=true`.

**Rutas para probar:** `/`, `/clases`, `/precios`, `/tienda`, `/mi-area`, `/mi-area/reservas`, `/entrenadora/clases`, `/admin`, `/admin/pagos`.

## Estilos

- En cada `.module.scss`: `@use 'mixins' as *;` y clases cortas en camelCase (`.root`, `.primary`, `.isActive`), sin BEM.
- Siempre tokens (`var(--mauve)`, `var(--space-6)`, `var(--radius-lg)`), nunca colores o tamaños sueltos.
- Importa con el alias `@`: `import Button from '@/components/ui/Button'`.

## Cómo trabajamos

Todo está en [`AGENTS.md`](AGENTS.md): la IA como mentora, idioma, DRY y SOLID, componentes, SASS, seguridad, ramas, Conventional Commits y Definition of Done.

## Si algo no funciona

- **No carga la API:** comprueba `/health`, `VITE_API_URL` y que las migraciones se aplicaron a la misma base que usa el servidor.
- **Error CORS o sesión que se pierde:** comprueba el origen completo permitido, el mismo hostname en frontend/API y las condiciones de cookies de HU-33.
- **Cambios de `.env` sin efecto:** reinicia Vite; para preview, vuelve a compilar.
- **Pantalla sin datos:** inicia sesión con el rol adecuado y prepara el seed en una base local vacía; el modo de inspección visual no proporciona datos ni permisos.

CI ejecuta instalación con `npm ci`, lint, Vitest y build en [`.github/workflows/build.yml`](.github/workflows/build.yml). También ejecuta `npm audit --audit-level=high` como aviso con `continue-on-error`; revisa su salida aunque el workflow esté verde.

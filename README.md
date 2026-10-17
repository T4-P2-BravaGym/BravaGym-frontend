# Brava · Web

Web de Brava, gimnasio de fuerza para mujeres: web pública, área de socia, panel de entrenadora y panel de administración.

**Stack:** React 19 con JavaScript, Vite, React Router y SASS (CSS Modules). Los estilos salen del sistema de diseño de Brava (`src/styles/_tokens.scss`).

## Arrancar en local

```bash
npm install                 # la primera vez: genera package-lock.json, súbelo al repo
cp .env.example .env        # apunta a la API local
npm run dev                 # http://localhost:5173
npm run lint                # ESLint, igual que la CI
npm test                    # tests (Vitest)
npm run build               # comprobar que compila antes de una PR
```

La API tiene que estar arrancada (repo BravaGym-backend) en `http://localhost:8000`.

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

Todas las rutas ya existen y cada página muestra su título, así que se puede navegar desde el primer día. Cada componente tiene un comentario con qué hace, sus props propuestas, de qué otros depende, en qué historias se usa y su nivel. Mientras no haya login, `ProtectedRoute` deja pasar a todas las rutas.

**Rutas para probar:** `/`, `/clases`, `/precios`, `/tienda`, `/mi-area`, `/mi-area/reservas`, `/entrenadora/clases`, `/admin`, `/admin/pagos`.

## Estilos

- En cada `.module.scss`: `@use 'mixins' as *;` y clases cortas en camelCase (`.root`, `.primary`, `.isActive`), sin BEM.
- Siempre tokens (`var(--mauve)`, `var(--space-6)`, `var(--radius-lg)`), nunca colores o tamaños sueltos.
- Importa con el alias `@`: `import Button from '@/components/ui/Button'`.

## Cómo trabajamos

Todo está en [`AGENTS.md`](AGENTS.md): la IA como mentora, idioma, DRY y SOLID, componentes, SASS, seguridad, ramas, Conventional Commits y Definition of Done.


## Recuperación de contraseña (HU-35)

Desde login, «He olvidado mi contraseña» abre `/recuperar-contrasena`. El formulario muestra siempre la misma confirmación tras un 202, sin revelar si existe la cuenta. `/nueva-contrasena` permite elegir y repetir la contraseña con las reglas del backend (ocho caracteres Unicode, máximo 72 bytes UTF-8). El enlace inválido ofrece solicitar otro; un fallo de conexión permite reintentar sin perder el token en memoria.

Requiere backend HU-35 y migración aplicada. La spec compartida es `specs/HU-35-password-reset.md` y la bitácora está en `docs/ai-log.md` del backend. En local, el mensaje se escribe en su outbox privado: no hay correo SMTP real. El origen `FRONTEND_URL` del backend debe coincidir con este frontend. No poner contraseñas, enlaces o tokens en variables VITE_*.

Los enlaces usan `/nueva-contrasena#token=...`; el fragmento se retira del historial al montar la página y el token solo vive en memoria. Tras una recarga, volver a abrir el enlace original o solicitar otro. No se guarda en localStorage/sessionStorage. Los dos endpoints de recuperación se llaman con `auth: false`, sin intentar renovar por un error de recuperación. Al terminar, se borran contraseña/token del formulario y la sesión local; el backend ya ha invalidado las sesiones anteriores. Se ofrece iniciar sesión normalmente, sin login automático.

Las páginas reutilizan PublicLayout minimal, Card, Field, Button y Alert. Los tests usan el mismo Vitest/Testing Library configurado por el equipo, sin dependencias nuevas. Capturas móviles de revisión: `docs/screenshots/hu35-request-mobile.png` y `hu35-reset-mobile.png`, sin datos ni tokens reales.

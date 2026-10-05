# Brava · Web

Web de Brava, gimnasio de fuerza para mujeres: web pública, área de socia, panel de entrenadora y panel de administración.

**Stack:** React 19 con JavaScript, Vite, React Router y SASS (CSS Modules). Los estilos salen del sistema de diseño de Brava (`src/styles/_tokens.scss`).

## Arrancar en local

```bash
npm install                 # la primera vez: genera package-lock.json, súbelo al repo
cp .env.example .env        # apunta a la API local
npm run dev                 # http://localhost:5173
npm run build               # comprobar que compila antes de una PR
```

La API tiene que estar arrancada (repo BravaGym-backend) en `http://localhost:8000`.

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

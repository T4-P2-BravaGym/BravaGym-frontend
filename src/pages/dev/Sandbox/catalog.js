/**
 * Catalog of the sandbox page: one entry per component, with what it is for, when not to
 * use it and its main props. The page text is in Spanish because it is read by the team.
 * When you add a component, add its entry here and its demo in demos.jsx (same `id`).
 */

export const GROUPS = [
  { id: 'ui', title: 'Piezas base', folder: 'components/ui', text: 'Sin lógica del gimnasio. Úsalas en cualquier página.' },
  { id: 'domain', title: 'Piezas de Brava', folder: 'components/domain', text: 'Conocen los datos de la API (clases, planes, rutinas…).' },
  { id: 'layout', title: 'Navegación', folder: 'components/layout', text: 'Cabecera, pie y menús. Ya están puestos en los layouts.' },
  { id: 'layouts', title: 'Layouts', folder: 'layouts', text: 'El marco de cada página. Se eligen en AppRouter, no en las páginas.' },
]

export const COMPONENTS = [
  // ── Piezas base ──────────────────────────────────────────────
  {
    id: 'button',
    name: 'Button',
    group: 'ui',
    use: 'Cualquier acción: reservar, guardar, pagar. También un enlace con aspecto de botón (con `to`).',
    avoid: 'Para filtrar usa Chip. Para un enlace dentro de un texto, un <Link> normal.',
    props: 'variant (primary · secondary · dark · quiet · danger), size="sm", to, href, fullWidth, disabled',
    tip: 'Un solo primary por vista. Si está desactivado, el texto dice por qué.',
  },
  {
    id: 'badge',
    name: 'Badge',
    group: 'ui',
    use: 'Mostrar un estado de la API (reservada, pagado, pendiente…) o una etiqueta corta.',
    avoid: 'No es clicable: para elegir algo usa Chip.',
    props: 'status (el valor de la API) · o tone (success · wait · danger · neutral · brand · solid) + texto',
    tip: 'Con `status` el texto y el color salen solos de utils/status.js.',
  },
  {
    id: 'chip',
    name: 'Chip',
    group: 'ui',
    use: 'Filtros: día de la semana, tipo de clase, categoría de la tienda.',
    avoid: 'Para acciones usa Button. Para cambiar de vista dentro de la página, Tabs.',
    props: 'selected, onClick',
    tip: 'Agrúpalos en un elemento con role="group" y un aria-label.',
  },
  {
    id: 'field',
    name: 'Field',
    group: 'ui',
    use: 'Todo campo de formulario: input, select o textarea, con su label, ayuda y error.',
    avoid: 'No pongas <input> sueltos: Field ya conecta el label y el error para lectores de pantalla.',
    props: 'label, as (input · select · textarea), hint, error + cualquier prop del control (type, value, onChange…)',
  },
  {
    id: 'card',
    name: 'Card',
    group: 'ui',
    use: 'Agrupar información en un bloque: resumen del plan, próxima clase…',
    avoid: 'Si es una pieza del gimnasio (clase, plan, producto) mira antes las Piezas de Brava.',
    props: 'variant (default · tint · dark), eyebrow, title',
    tip: 'tint como mucho una por fila: es la que pide atención.',
  },
  {
    id: 'modal',
    name: 'Modal',
    group: 'ui',
    use: 'Confirmar algo que no se puede deshacer: cancelar una reserva, aprobar una baja.',
    avoid: 'Para avisar del resultado usa Alert. No metas formularios largos.',
    props: 'open, title, description, confirmLabel, cancelLabel, tone="danger", busy, onConfirm, onClose',
  },
  {
    id: 'table',
    name: 'Table',
    group: 'ui',
    use: 'Listas de datos de los paneles de admin: pagos, usuarias, productos.',
    avoid: 'Para la socia en el móvil mejor tarjetas (SessionCard, Card).',
    props: 'columns [{ key, header, render?, align? }], rows, caption, emptyTitle, emptyText',
    tip: 'Si no hay filas muestra un EmptyState solo.',
  },
  {
    id: 'pagination',
    name: 'Pagination',
    group: 'ui',
    use: 'Debajo de una Table cuando la API devuelve page, size y total.',
    props: 'page, size, total, onChange(nextPage)',
  },
  {
    id: 'tabs',
    name: 'Tabs',
    group: 'ui',
    use: 'Cambiar de vista dentro de la misma página: los días de una rutina.',
    avoid: 'Para filtrar una lista usa Chip. Para ir a otra página, la navegación.',
    props: 'tabs [{ id, label }], active, onChange(id), label, action, children (contenido de la pestaña activa)',
  },
  {
    id: 'spinner',
    name: 'Spinner',
    group: 'ui',
    use: 'Mientras la API responde.',
    props: 'label, hideLabel',
  },
  {
    id: 'empty-state',
    name: 'EmptyState',
    group: 'ui',
    use: 'Cuando una lista está vacía: dice qué pasa y qué hacer a continuación.',
    avoid: 'Para errores usa Alert tone="error".',
    props: 'title, text, action',
  },
  {
    id: 'alert',
    name: 'Alert',
    group: 'ui',
    use: 'Resultado de una acción (reserva confirmada) o error de la API, ya traducido.',
    avoid: 'Nunca muestres el código ("409"): el texto explica qué pasó y cómo seguir.',
    props: 'tone (info · success · warning · error), title, children, onClose',
  },
  {
    id: 'avatar',
    name: 'Avatar',
    group: 'ui',
    use: 'Iniciales de una socia o entrenadora, siempre con el nombre al lado.',
    props: 'name, size (sm · md · lg), tone (mauve · champagne)',
  },
  {
    id: 'icon',
    name: 'Icon',
    group: 'ui',
    use: 'Iconos de línea que toman el color del texto. Nunca emojis.',
    props: 'name, size (px), label (solo si el icono va sin texto)',
  },

  // ── Piezas de Brava ──────────────────────────────────────────
  {
    id: 'session-card',
    name: 'SessionCard',
    group: 'domain',
    use: 'Una clase del horario con su estado para la socia y el botón que toca.',
    avoid: 'Para la semana entera usa WeekSchedule, que ya las pinta.',
    props: 'session, booking, now, busy, onBook, onCancel, onLeaveWaitlist',
    tip: 'Aplica sola la regla de cancelar con 1 hora de antelación (RN-05).',
  },
  {
    id: 'week-schedule',
    name: 'WeekSchedule',
    group: 'domain',
    use: 'El horario semanal con filtros por día y por tipo de clase.',
    props: 'sessions, bookings { [sessionId]: booking }, now, busyId, onBook, onCancel, onLeaveWaitlist',
  },
  {
    id: 'capacity-bar',
    name: 'CapacityBar',
    group: 'domain',
    use: 'Plazas ocupadas de una clase, para la entrenadora o la admin.',
    props: 'taken, capacity',
  },
  {
    id: 'stat-card',
    name: 'StatCard',
    group: 'domain',
    use: 'Una cifra del resumen de admin con enlace a su lista.',
    props: 'label, value, to, linkLabel, tone (default · tint)',
  },
  {
    id: 'pricing-card',
    name: 'PricingCard',
    group: 'domain',
    use: 'Un plan en la página de precios, o el plan actual de la socia.',
    props: 'plan, features, featured, current, ctaLabel, onSelect(plan), to',
    tip: 'featured solo en un plan por página.',
  },
  {
    id: 'subscription-card',
    name: 'SubscriptionCard',
    group: 'domain',
    use: 'La suscripción de la socia en "Mi área": plan, precio, estado y fecha de alta.',
    avoid: 'Para elegir o cambiar de plan usa PricingCard.',
    props: 'subscription (o null), pricingTo, paymentsTo',
    tip: 'Con subscription={null} invita a ver los planes.',
  },
  {
    id: 'trainer-card',
    name: 'TrainerCard',
    group: 'domain',
    use: 'Una entrenadora en la página pública o al elegir entrenamiento personal.',
    props: 'trainer { id, name, specialty, bio }, to, linkLabel',
  },
  {
    id: 'product-card',
    name: 'ProductCard',
    group: 'domain',
    use: 'Un producto de la tienda con su botón Añadir (o Agotado).',
    props: 'product, busy, onAdd(product)',
  },
  {
    id: 'cart-summary',
    name: 'CartSummary',
    group: 'domain',
    use: 'El carrito: cantidades, total estimado y confirmar el pedido.',
    props: 'items, busy, onChangeQuantity(id, quantity), onRemove(id), onCheckout',
  },
  {
    id: 'discount-code-input',
    name: 'DiscountCodeInput',
    group: 'domain',
    use: 'Aplicar un código de descuento al pagar (RN-14).',
    props: 'applied, onApply(code) (lanza un error con el mensaje si no vale), onRemove',
  },
  {
    id: 'exercise-row',
    name: 'ExerciseRow',
    group: 'domain',
    use: 'Una línea de la rutina (ejercicio, series × reps, descanso) para leerla.',
    avoid: 'Para editar la rutina usa RoutineEditor.',
    props: 'line { position, exercise_name, sets, reps, rest_seconds }',
    tip: 'Es un <li>: ponlo dentro de un <ol>.',
  },
  {
    id: 'routine-editor',
    name: 'RoutineEditor',
    group: 'domain',
    use: 'La entrenadora crea o cambia la rutina de una socia.',
    props: 'members, exercises, initialRoutine, busy, error, onSave(payload)',
    tip: 'onSave recibe el cuerpo tal como lo espera la API.',
  },
  {
    id: 'cancellation-request-card',
    name: 'CancellationRequestCard',
    group: 'domain',
    use: 'Una solicitud de baja en la bandeja de admin, con aprobar o rechazar.',
    props: 'request, busy, onApprove(request, notes), onReject(request, notes)',
    tip: 'Rechazar exige notas (RN-13).',
  },

  // ── Navegación ───────────────────────────────────────────────
  {
    id: 'navbar',
    name: 'Navbar',
    group: 'layout',
    use: 'Cabecera de la web pública. Ya está en PublicLayout: no la pongas en las páginas.',
    props: 'ninguna (lee la sesión de useAuth)',
  },
  {
    id: 'footer',
    name: 'Footer',
    group: 'layout',
    use: 'Pie de la web pública. Ya está en PublicLayout.',
    props: 'ninguna',
  },
  {
    id: 'side-nav',
    name: 'SideNav',
    group: 'layout',
    use: 'Menú lateral de las áreas privadas. Ya está en PrivateLayout.',
    props: 'area (de routes/navigation.js), user { name, roleLabel }, onLogout',
    tip: 'Para añadir una entrada al menú, edita routes/navigation.js, no este componente.',
  },
  {
    id: 'mobile-tab-bar',
    name: 'MobileTabBar',
    group: 'layout',
    use: 'Barra inferior de la socia en el móvil. Ya está en PrivateLayout.',
    props: 'items [{ to, label, icon }]',
    tip: 'Las entradas con mobile: true en routes/navigation.js salen aquí.',
  },

  // ── Layouts ──────────────────────────────────────────────────
  {
    id: 'public-layout',
    name: 'PublicLayout',
    group: 'layouts',
    use: 'Marco de las páginas públicas: Navbar, contenido y Footer.',
    props: 'ninguna (la página va en <Outlet />)',
  },
  {
    id: 'private-layout',
    name: 'PrivateLayout',
    group: 'layouts',
    use: 'Marco de las áreas de socia, entrenadora y admin: SideNav, contenido y MobileTabBar.',
    props: 'ninguna (elige el menú según el rol)',
  },
]

/** "I need to…" → which component. The quick guide at the top of the page. */
export const NEEDS = [
  { need: 'Un botón o una acción', ids: ['button'] },
  { need: 'Mostrar un estado (pagado, reservada…)', ids: ['badge'] },
  { need: 'Filtrar una lista', ids: ['chip'] },
  { need: 'Un formulario', ids: ['field', 'button'] },
  { need: 'Avisar del resultado o de un error', ids: ['alert'] },
  { need: 'Confirmar antes de algo irreversible', ids: ['modal'] },
  { need: 'Una lista vacía', ids: ['empty-state'] },
  { need: 'Esperar a la API', ids: ['spinner'] },
  { need: 'Una tabla de admin', ids: ['table', 'pagination'] },
  { need: 'Un bloque de información', ids: ['card'] },
  { need: 'El horario de clases', ids: ['week-schedule', 'session-card'] },
  { need: 'Cifras del panel de admin', ids: ['stat-card'] },
]

/** The import line to copy for an entry. */
export function importLine(entry) {
  const base = entry.group === 'layouts' ? '@/layouts' : `@/components/${entry.group}`
  return `import ${entry.name} from '${base}/${entry.name}'`
}

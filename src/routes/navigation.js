import { PATHS } from './paths'

/**
 * Navigation of each private area, in one place (DRY).
 * PrivateLayout picks the area from the user's role (or from the URL while there is no login).
 * `icon` names an icon of MobileTabBar; `mobile: true` puts the entry in the phone tab bar.
 */
export const NAVIGATION = {
  member: {
    eyebrow: null,
    label: 'Área de socia',
    items: [
      { to: PATHS.member, label: 'Inicio', icon: 'home', end: true },
      { to: PATHS.bookings, label: 'Reservar clases', icon: 'calendar', mobile: true },
      { to: PATHS.personalTraining, label: 'Entrenamiento personal', icon: 'user' },
      { to: PATHS.myRoutine, label: 'Mi rutina', icon: 'dumbbell', mobile: true },
      { to: PATHS.myPayments, label: 'Mis pagos', icon: 'card', mobile: true },
      { to: PATHS.cart, label: 'Tienda', icon: 'bag', mobile: true },
      { to: PATHS.profile, label: 'Mi perfil', icon: 'user' },
    ],
  },
  trainer: {
    eyebrow: 'Entrenadoras',
    label: 'Panel de entrenadora',
    items: [
      { to: PATHS.trainerSessions, label: 'Mis clases', icon: 'calendar' },
      { to: PATHS.trainerSlots, label: 'Entrenamiento personal', icon: 'user' },
      { to: PATHS.trainerRoutines, label: 'Rutinas', icon: 'dumbbell' },
      { to: PATHS.trainerProfile, label: 'Mi perfil público', icon: 'user' },
    ],
  },
  admin: {
    eyebrow: 'Administración',
    label: 'Panel de administración',
    items: [
      { to: PATHS.admin, label: 'Resumen', icon: 'home', end: true },
      { to: PATHS.adminPayments, label: 'Pagos', icon: 'card' },
      { to: PATHS.adminCancellations, label: 'Bajas', icon: 'door' },
      { to: PATHS.adminDiscountCodes, label: 'Ofertas y códigos', icon: 'tag' },
      { to: PATHS.adminUsers, label: 'Usuarias y roles', icon: 'users' },
      { to: PATHS.adminPlans, label: 'Planes', icon: 'list' },
      { to: PATHS.adminProducts, label: 'Tienda', icon: 'bag' },
    ],
  },
}

// superadmin sees the admin area; trainer tools are reachable from the URL.
const AREA_BY_ROLE = { member: 'member', trainer: 'trainer', admin: 'admin', superadmin: 'admin' }

export const ROLE_LABELS = {
  member: 'Socia',
  trainer: 'Entrenadora',
  admin: 'Administración',
  superadmin: 'Superadmin',
}

/** The area for this role, or (before login exists) the one the URL belongs to. */
export function areaFor(role, pathname = '') {
  if (pathname.startsWith('/entrenadora')) return 'trainer'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/mi-area')) return 'member'
  return AREA_BY_ROLE[role] ?? 'member'
}

/** Every route path in one place (DRY): import PATHS instead of writing strings. */
export const PATHS = {
  home: '/',
  schedule: '/clases',
  trainers: '/entrenadoras',
  pricing: '/precios',
  shop: '/tienda',
  login: '/entrar',
  register: '/registro',

  member: '/mi-area',
  bookings: '/mi-area/reservas',
  personalTraining: '/mi-area/entrenamiento-personal',
  myRoutine: '/mi-area/rutina',
  myPayments: '/mi-area/pagos',
  cart: '/mi-area/carrito',
  profile: '/mi-area/perfil',

  trainerSessions: '/entrenadora/clases',
  trainerSlots: '/entrenadora/franjas',
  trainerRoutines: '/entrenadora/rutinas',
  trainerProfile: '/entrenadora/perfil',

  admin: '/admin',
  adminPayments: '/admin/pagos',
  adminCancellations: '/admin/bajas',
  adminDiscountCodes: '/admin/codigos',
  adminUsers: '/admin/usuarias',
  adminPlans: '/admin/planes',
  adminProducts: '/admin/productos',

  // Sandbox with every component, for the team (see pages/dev/Sandbox).
  sandbox: '/sandbox',
}

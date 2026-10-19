/**
 * Every API status, with the Spanish label and the Badge tone it always uses.
 * One place for all of them (DRY): the same status looks the same everywhere.
 */
export const STATUS = {
  // sessions
  scheduled: { label: 'Programada', tone: 'success' },
  // bookings
  confirmed: { label: 'Reservada', tone: 'success' },
  waitlisted: { label: 'Lista de espera', tone: 'wait' },
  cancelled: { label: 'Cancelada', tone: 'neutral' },
  // payments
  paid: { label: 'Pagado', tone: 'success' },
  pending: { label: 'Pendiente', tone: 'wait' },
  failed: { label: 'Fallido', tone: 'danger' },
  refunded: { label: 'Reembolsado', tone: 'neutral' },
  // subscriptions
  active: { label: 'Activa', tone: 'success' },
  expired: { label: 'Caducada', tone: 'neutral' },
  // cancellation requests
  approved: { label: 'Aprobada', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
}

export function statusInfo(status) {
  return STATUS[status] ?? { label: status, tone: 'neutral' }
}

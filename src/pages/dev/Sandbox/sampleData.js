/**
 * Example data for the component gallery only. Not real members, prices or classes.
 * Times are relative to NOW so every session state is visible.
 */
export const NOW = new Date('2026-10-05T14:00:00Z')

const at = (minutesFromNow) => new Date(NOW.getTime() + minutesFromNow * 60000).toISOString()
const day = (days, hourUtc) => {
  const d = new Date(NOW)
  d.setUTCDate(d.getUTCDate() + days)
  d.setUTCHours(hourUtc, 0, 0, 0)
  return d.toISOString()
}

export const SESSIONS = [
  { id: 1, starts_at: at(240), duration_minutes: 60, class_type_name: 'Fuerza básica', trainer_name: 'Nora', free_spots: 4, extra_price_cents: 0, status: 'scheduled' },
  { id: 2, starts_at: at(30), duration_minutes: 50, class_type_name: 'Glúteo y core', trainer_name: 'Laura', free_spots: 0, extra_price_cents: 0, status: 'scheduled' },
  { id: 3, starts_at: at(300), duration_minutes: 45, class_type_name: 'Movilidad', trainer_name: 'Irene', free_spots: 0, extra_price_cents: 0, status: 'scheduled' },
  { id: 4, starts_at: at(360), duration_minutes: 90, class_type_name: 'Taller de peso muerto', trainer_name: 'Irene', free_spots: 2, extra_price_cents: 500, status: 'scheduled' },
  { id: 5, starts_at: day(1, 16), duration_minutes: 60, class_type_name: 'Fuerza básica', trainer_name: 'Nora', free_spots: 1, extra_price_cents: 0, status: 'scheduled' },
  { id: 6, starts_at: day(1, 17), duration_minutes: 45, class_type_name: 'Movilidad', trainer_name: 'Irene', free_spots: 0, extra_price_cents: 0, status: 'scheduled' },
  { id: 7, starts_at: day(2, 6), duration_minutes: 60, class_type_name: 'Fuerza básica', trainer_name: 'Nora', free_spots: 6, extra_price_cents: 0, status: 'scheduled' },
  { id: 8, starts_at: day(2, 17), duration_minutes: 50, class_type_name: 'Glúteo y core', trainer_name: 'Laura', free_spots: 3, extra_price_cents: 0, status: 'cancelled' },
]

export const BOOKINGS = {
  2: { id: 21, status: 'confirmed' },
  3: { id: 22, status: 'waitlisted', waitlist_position: 2 },
  5: { id: 23, status: 'confirmed' },
  6: { id: 24, status: 'waitlisted', waitlist_position: 1 },
}

export const PLANS = [
  { id: 1, name: 'Básico', description: 'Para empezar con las clases en grupo.', monthly_price_cents: 3900, includes_personal_training: false },
  { id: 2, name: 'Completo', description: 'Para entrenar cuando quieras, con seguimiento.', monthly_price_cents: 5900, includes_personal_training: false },
  { id: 3, name: 'Personal', description: 'Para quien quiere atención uno a uno.', monthly_price_cents: 9900, includes_personal_training: true },
]

export const PLAN_FEATURES = {
  1: ['Hasta 2 clases a la semana', 'Reserva y cancelación en la app'],
  2: ['Clases en grupo sin límite', 'Rutina diseñada por tu entrenadora'],
  3: ['Todo lo del plan Completo'],
}

export const TRAINERS = [
  { id: 1, name: 'Nora Gil', specialty: 'Fuerza y técnica', bio: 'Para que pierdas el miedo a la barra y entiendas cada movimiento.' },
  { id: 2, name: 'Laura Peña', specialty: 'Iniciación a la fuerza', bio: 'Tu primera rutina, paso a paso y a tu ritmo.' },
]

export const PRODUCTS = [
  { id: 1, name: 'Proteína whey · vainilla', category_name: 'Suplementos', price_cents: 3490, stock: 12 },
  { id: 2, name: 'Leggings de entreno', category_name: 'Ropa', price_cents: 4200, stock: 5 },
  { id: 3, name: 'Botella térmica', category_name: 'Accesorios', price_cents: 1890, stock: 0 },
]

export const PRODUCT_CATEGORIES = [
  { id: 1, name: 'Accesorios' },
  { id: 2, name: 'Ropa' },
  { id: 3, name: 'Suplementos' },
]

export const ADMIN_PRODUCT = {
  id: 1,
  category_id: 3,
  category_name: 'Suplementos',
  name: 'Proteína whey · vainilla',
  description: 'Bote de 1 kg.',
  price_cents: 3490,
  stock: 12,
  in_stock: true,
  is_active: true,
}

export const CART = [
  { product_id: 1, name: 'Proteína whey · vainilla', unit_price_cents: 3490, quantity: 1, stock: 12 },
  { product_id: 2, name: 'Leggings de entreno', unit_price_cents: 4200, quantity: 2, stock: 5 },
]

export const ROUTINE_LINES = [
  { position: 1, exercise_name: 'Sentadilla goblet', sets: 4, reps: 10, rest_seconds: 90 },
  { position: 2, exercise_name: 'Peso muerto rumano', sets: 3, reps: 10, rest_seconds: 90 },
  { position: 3, exercise_name: 'Hip thrust', sets: 4, reps: 12, rest_seconds: 60 },
]

export const MEMBERS = [
  { id: 10, name: 'Marta Ruiz' },
  { id: 11, name: 'Lucía Gómez' },
]

export const EXERCISES = [
  { id: 1, name: 'Sentadilla goblet' },
  { id: 2, name: 'Peso muerto rumano' },
  { id: 3, name: 'Hip thrust' },
  { id: 4, name: 'Plancha' },
]

export const INITIAL_ROUTINE = {
  member_id: 10,
  name: 'Fuerza · bloque 1',
  lines: [
    { day_number: 1, position: 1, exercise_id: 1, sets: 4, reps: 10, rest_seconds: 90 },
    { day_number: 1, position: 2, exercise_id: 3, sets: 4, reps: 12, rest_seconds: 60 },
    { day_number: 2, position: 1, exercise_id: 2, sets: 3, reps: 10, rest_seconds: 90 },
  ],
}

export const PAYMENTS = [
  { id: 1, member: 'Marta Ruiz', concept: 'Cuota · Completo', created_at: day(0, 8), final_amount_cents: 5900, status: 'pending' },
  { id: 2, member: 'Lucía Gómez', concept: 'Taller de peso muerto', created_at: day(-1, 9), final_amount_cents: 500, status: 'paid' },
  { id: 3, member: 'Ana Pérez', concept: 'Pedido tienda #14', created_at: day(-2, 10), final_amount_cents: 7690, status: 'failed' },
  { id: 4, member: 'Sara Molina', concept: 'Cuota · Básico', created_at: day(-3, 9), final_amount_cents: 3510, status: 'refunded' },
]

export const REQUESTS = [
  { id: 1, member_name: 'Elena Vidal', plan_name: 'Básico', requested_at: day(-2, 9), reason: 'Me cambio de ciudad el mes que viene.', status: 'pending' },
  { id: 2, member_name: 'Paula Sanz', plan_name: 'Completo', requested_at: day(-9, 9), reason: 'Por horarios no puedo venir este trimestre.', status: 'rejected', admin_notes: 'Le ofrecemos pausar la cuota dos meses.' },
]

export const MY_SUBSCRIPTION = {
  id: 1,
  status: 'active',
  start_date: '2026-10-06',
  end_date: null,
  plan: PLANS[2],
}
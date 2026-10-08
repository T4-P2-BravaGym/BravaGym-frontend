/**
 * What the admin sees in the "Estado" column. Derived from the code's data, never stored.
 */
export function codeStatus(code, today = new Date().toISOString().slice(0, 10)) {
  if (!code.is_active) return { label: 'Desactivado', tone: 'neutral' }
  if (code.valid_until < today) return { label: 'Caducado', tone: 'neutral' }
  if (code.max_uses !== null && code.uses >= code.max_uses) return { label: 'Agotado', tone: 'wait' }
  if (code.valid_from > today) return { label: 'Programado', tone: 'brand' }
  return { label: 'Activo', tone: 'success' }
}
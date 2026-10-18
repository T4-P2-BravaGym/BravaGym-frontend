/** What a discount code can be limited to (T-240). An empty value means every payment. */
export const APPLIES_TO_OPTIONS = [
  { value: '', label: 'Todo' },
  { value: 'subscription', label: 'Cuotas' },
  { value: 'booking', label: 'Clases' },
  { value: 'order', label: 'Tienda' },
]

export function appliesToLabel(appliesTo) {
  return APPLIES_TO_OPTIONS.find((option) => option.value === (appliesTo ?? ''))?.label ?? appliesTo
}
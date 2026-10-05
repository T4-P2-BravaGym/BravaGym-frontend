import Button from '@/components/ui/Button'
import styles from './Pagination.module.scss'

/**
 * Pagination
 * "Mostrando 1–20 de 48" plus previous / next, from the API's { page, size, total }.
 *
 * Props: page, size, total, onChange(nextPage)
 */
export default function Pagination({ page, size, total, onChange }) {
  if (!total) return null
  const lastPage = Math.max(1, Math.ceil(total / size))
  const from = (page - 1) * size + 1
  const to = Math.min(page * size, total)

  return (
    <nav className={styles.root} aria-label="Paginación">
      <span className={styles.summary} aria-live="polite">
        Mostrando {from}–{to} de {total}
      </span>
      <div className={styles.buttons}>
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Anterior
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
          Siguiente
        </Button>
      </div>
    </nav>
  )
}

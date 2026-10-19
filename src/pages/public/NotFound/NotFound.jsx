import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { PATHS } from '@/routes/paths'
import styles from './NotFound.module.scss'

export default function NotFound() {
  return (
      <main className={styles.root}>
        <EmptyState
            title="Esta página no existe"
            text="Puede que el enlace esté mal escrito o que la página ya no esté disponible."
            action={
              <Button variant="primary" to={PATHS.home}>
                Volver al inicio
              </Button>
            }
        />
      </main>
  )
}
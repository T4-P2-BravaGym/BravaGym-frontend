/**
 * Entrenadoras
 */
import TrainerCard from '@/components/domain/TrainerCard'
import styles from './Trainers.module.scss'
import { PATHS } from '@/routes/paths'
import { listTrainers } from '@/services/trainers'
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'

export default function Trainers() {
  const [trainers, setTrainers] = useState([])     
  const [loading, setLoading] = useState(true)     
  const [error, setError] = useState(null)
  useEffect(() => {
    listTrainers()
      .then((data) => setTrainers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])
  return (
    <section>
      <h1>Entrenadoras</h1>
      {loading && <Spinner />}

      {error && <Alert tone="error" title="No hemos podido cargar las entrenadoras">{error}</Alert>}

      {!loading && !error && trainers.length === 0 && (
        <EmptyState title="Todavía no hay entrenadoras" />
      )}
      <div className={styles.grid}>
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            to={`${PATHS.personalTraining}?entrenadora=${trainer.id}`}
          />
        ))}
      </div>
    </section>
  )
}

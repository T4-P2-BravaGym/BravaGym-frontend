
import { useEffect, useState } from 'react'
import PricingCard from '@/components/domain/PricingCard'
import { PATHS } from '@/routes/paths'
import { listPlans } from '@/services/plans'
import styles from './Pricing.module.scss'

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    listPlans()
      .then((data) => {
        if (active) setPlans(data)
      })
      .catch(() => {
        if (active) setError('No se han podido cargar los planes.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section>
      <h1>Precios</h1>

      {loading && <p role="status">Cargando planes…</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && plans.length === 0 && (
        <p>No hay planes disponibles en este momento.</p>
      )}

      <div className={styles.grid}>
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} to={PATHS.register} />
        ))}
      </div>
    </section>
  )
}
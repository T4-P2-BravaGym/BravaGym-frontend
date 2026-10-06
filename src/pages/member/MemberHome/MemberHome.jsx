import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SubscriptionCard from '@/components/domain/SubscriptionCard'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import { PATHS } from '@/routes/paths'
import { getMySubscriptions } from '@/services/subscriptions'
import styles from './MemberHome.module.scss'

/**
 * Inicio de la socia ("Mi área").
 * HU-09: subscription block. TODO(HU-04): profile summary.
 */

export default function MemberHome() {
  const location = useLocation()
  const navigate = useNavigate()
  const flash = location.state?.flash
  const [subscriptions, setSubscriptions] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getMySubscriptions({ signal: controller.signal })
        .then(setSubscriptions)
        .catch((apiError) => {
          if (apiError.name !== 'AbortError') setError(apiError.detail)
        })
    return () => controller.abort()
  }, [])

  function closeFlash() {
    navigate(location.pathname, { replace: true, state: null })
  }

  return (
      <div className={styles.root}>
        <h1 className={styles.title}>Mi área</h1>

        {flash && (
            <Alert tone="success" onClose={closeFlash}>
              {flash}
            </Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}

        {!subscriptions && !error && <Spinner label="Cargando tu suscripción…" />}
        {subscriptions && (
            <SubscriptionCard
                subscription={subscriptions.current}
                pricingTo={PATHS.pricing}
                paymentsTo={PATHS.myPayments}
            />
        )}
      </div>
  )
}
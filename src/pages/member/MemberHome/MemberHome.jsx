import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CancellationPanel from '@/components/domain/CancellationPanel'
import SubscriptionCard from '@/components/domain/SubscriptionCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { PATHS } from '@/routes/paths'
import { ApiError } from '@/services/api'
import { getMyCancellationRequest, requestCancellation } from '@/services/cancellations'
import { getMySubscriptions } from '@/services/subscriptions'
import styles from './MemberHome.module.scss'

const LOAD_REQUEST_ERROR = 'No se ha podido cargar tu solicitud de baja. Inténtalo de nuevo.'
const GENERIC_SUBMIT_ERROR = 'No se ha podido enviar la solicitud. Inténtalo de nuevo.'
const ALREADY_PENDING = 'Ya tienes una solicitud de baja pendiente.'
const NO_ACTIVE_SUBSCRIPTION =
  'Necesitas una suscripción activa para solicitar la baja. Elige un plan en Precios.'
const SUCCESS_MESSAGE =
  'Solicitud enviada. Sigues activa hasta que administración la revise.'

/**
 * Inicio de la socia ("Mi área").
 * HU-09: subscription block. HU-19.3: cancellation request form and status.
 * TODO(HU-04): profile summary.
 */
export default function MemberHome() {
  const location = useLocation()
  const navigate = useNavigate()
  const flashFromNav = location.state?.flash

  const [subscriptions, setSubscriptions] = useState(null)
  const [subscriptionError, setSubscriptionError] = useState(null)

  const [request, setRequest] = useState(null)
  const [requestLoading, setRequestLoading] = useState(true)
  const [requestError, setRequestError] = useState(null)

  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busy, setBusy] = useState(false)

  const loadRequest = useCallback((signal) => {
    setRequestLoading(true)
    return getMyCancellationRequest({ signal })
      .then((data) => {
        setRequest(data)
        setRequestError(null)
        return data
      })
      .catch((apiError) => {
        if (apiError.name === 'AbortError') return
        setRequestError(apiError.detail ?? LOAD_REQUEST_ERROR)
        setRequest(null)
      })
      .finally(() => {
        if (!signal?.aborted) setRequestLoading(false)
      })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    getMySubscriptions({ signal: controller.signal })
      .then(setSubscriptions)
      .catch((apiError) => {
        if (apiError.name !== 'AbortError') setSubscriptionError(apiError.detail)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadRequest(controller.signal)
    return () => controller.abort()
  }, [loadRequest])

  function closeNavFlash() {
    navigate(location.pathname, { replace: true, state: null })
  }

  async function handleSubmit(reason) {
    setActionError(null)
    setFlash(null)
    setBusy(true)
    try {
      const created = await requestCancellation({ reason })
      setRequest(created)
      setFlash(SUCCESS_MESSAGE)
      await loadRequest()
    } catch (error) {
      setActionError(submitErrorMessage(error))
      throw error
    } finally {
      setBusy(false)
    }
  }

  const current = subscriptions?.current ?? null
  const hasActiveSubscription = current?.status === 'active'

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mi área</h1>
        <p className={styles.lead}>Tu suscripción y el estado de una posible baja.</p>
      </header>

      {flashFromNav && (
        <Alert tone="success" onClose={closeNavFlash}>
          {flashFromNav}
        </Alert>
      )}
      {flash && (
        <Alert tone="success" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      )}
      {actionError && (
        <Alert
          tone="error"
          title={actionError.title}
          onClose={() => setActionError(null)}
        >
          {actionError.text}
          {actionError.showPricing && (
            <div className={styles.alertAction}>
              <Button to={PATHS.pricing} variant="secondary" size="sm">
                Ver planes
              </Button>
            </div>
          )}
        </Alert>
      )}
      {subscriptionError && <Alert tone="error">{subscriptionError}</Alert>}
      {requestError && <Alert tone="error">{requestError}</Alert>}

      {!subscriptions && !subscriptionError && <Spinner label="Cargando tu suscripción…" />}
      {subscriptions && (
        <SubscriptionCard
          subscription={current}
          pricingTo={PATHS.pricing}
          paymentsTo={PATHS.myPayments}
        />
      )}

      <CancellationPanel
        request={request}
        hasActiveSubscription={hasActiveSubscription}
        loading={requestLoading}
        busy={busy}
        onSubmit={handleSubmit}
        pricingTo={PATHS.pricing}
      />
    </div>
  )
}

function submitErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return { title: 'Error', text: GENERIC_SUBMIT_ERROR, showPricing: false }
  }
  if (error.status === 403) {
    return {
      title: 'No puedes solicitar la baja',
      text: error.detail || NO_ACTIVE_SUBSCRIPTION,
      showPricing: true,
    }
  }
  if (error.status === 409) {
    return {
      title: 'Solicitud ya enviada',
      text: error.detail || ALREADY_PENDING,
      showPricing: false,
    }
  }
  if (error.status === 422) {
    return {
      title: 'Revisa el formulario',
      text: error.detail || 'Revisa los datos del formulario.',
      showPricing: false,
    }
  }
  return {
    title: 'No se pudo enviar',
    text: error.detail || GENERIC_SUBMIT_ERROR,
    showPricing: false,
  }
}

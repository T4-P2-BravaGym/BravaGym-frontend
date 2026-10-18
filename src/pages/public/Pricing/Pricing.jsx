import { useEffect, useState } from 'react'
import PricingCard from '@/components/domain/PricingCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import PageHeader from '@/components/ui/PageHeader'
import useAuth from '@/hooks/useAuth'
import useSubscribe from '@/hooks/useSubscribe'
import { PATHS } from '@/routes/paths'
import { listPlans } from '@/services/plans'
import styles from './Pricing.module.scss'

const PERSONAL_TRAINING_EXTRAS = ['Eliges entrenadora y horario desde la app']

const INCLUDED = [
  { icon: 'calendar', text: 'Reserva y cancela tus clases desde la app' },
  { icon: 'clock', text: 'Lista de espera: si se libera una plaza, entras automáticamente' },
  { icon: 'list', text: 'Tu rutina, preparada por tu entrenadora' },
  { icon: 'users', text: 'Grupos pequeños, solo mujeres' },
]

const STEPS = [
  { title: 'Elige entrenadora', text: 'Ves su especialidad y su forma de trabajar.' },
  { title: 'Reserva una hora', text: 'Escoges una de sus franjas libres desde la app.' },
  { title: 'Entrenáis a solas', text: 'Técnica, objetivos y rutina a tu medida.' },
]

const FAQS = [
  {
    question: '¿Necesito experiencia?',
    answer: 'No. Las entrenadoras adaptan cada ejercicio a tu nivel, tanto si empiezas de cero como si llevas años levantando.',
  },
  {
    question: '¿Cuándo pago la primera cuota?',
    answer: 'Al contratar el plan se crea tu primera cuota. La pagas desde "Mis pagos" y, si tienes un código de descuento, lo aplicas ahí.',
  },
  {
    question: '¿Y si una clase está llena?',
    answer: 'Te apuntas a la lista de espera. Si alguien cancela, la primera de la lista pasa a tener plaza automáticamente.',
  },
  {
    question: '¿Puedo cancelar una reserva?',
    answer: 'Sí, hasta 1 hora antes de que empiece la clase, desde "Mis reservas".',
  },
  {
    question: '¿Cómo me doy de baja?',
    answer: 'La pides desde tu área con un motivo y el equipo de Brava revisa la solicitud. Mientras tanto, sigues activa.',
  },
]

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const { subscribe, currentPlanId, pendingPlanId, error: subscribeError, clearError } = useSubscribe()

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

  const featuredPlan = plans.find((plan) => plan.includes_personal_training)

  return (
      <div className={styles.page}>
        <PageHeader
            eyebrow="Planes"
            title="Precios"
            lead="Elige cuántas clases quieres y si quieres entrenar a solas con tu entrenadora. Todos los planes incluyen la app y la rutina que te prepara tu entrenadora."
        />

        {subscribeError && (
            <Alert tone="error" onClose={clearError}>
              {subscribeError}
            </Alert>
        )}

        {loading && <p role="status">Cargando planes…</p>}

        {error && <Alert tone="error">{error}</Alert>}

        {!loading && !error && plans.length === 0 && <p>No hay planes disponibles en este momento.</p>}

        {plans.length > 0 && (
            <section aria-labelledby="pricing-plans-title">
              <h2 id="pricing-plans-title" className={styles.hiddenTitle}>
                Planes
              </h2>
              <div className={styles.grid}>
                {plans.map((plan) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        features={plan.includes_personal_training ? PERSONAL_TRAINING_EXTRAS : []}
                        featured={plan.id === featuredPlan?.id}
                        current={plan.id === currentPlanId}
                        ctaLabel={plan.id === pendingPlanId ? 'Contratando…' : undefined}
                        to={isAuthenticated ? undefined : PATHS.register}
                        onSelect={isAuthenticated ? subscribe : undefined}
                    />
                ))}
              </div>
            </section>
        )}

        <section aria-labelledby="pricing-included-title">
          <h2 id="pricing-included-title" className={styles.sectionTitle}>
            Incluido en todos los planes
          </h2>
          <ul className={styles.included}>
            {INCLUDED.map((item) => (
                <li key={item.text} className={styles.includedItem}>
              <span className={styles.includedIcon}>
                <Icon name={item.icon} size={22} />
              </span>
                  {item.text}
                </li>
            ))}
          </ul>
        </section>

        {featuredPlan && (
            <section className={styles.spotlight} aria-labelledby="pricing-spotlight-title">
              <div className={styles.spotlightText}>
                <span className={styles.eyebrow}>Solo en {featuredPlan.name}</span>
                <h2 id="pricing-spotlight-title" className={styles.spotlightTitle}>
                  Una hora a solas con tu entrenadora
                </h2>
                <p className={styles.spotlightLead}>
                  Además de todas las clases en grupo, reservas sesiones de entrenamiento personal: alguien
                  que mira tu técnica de cerca y ajusta tu plan a lo que quieres conseguir.
                </p>
                <Button to={PATHS.trainers} variant="secondary">
                  Conoce a las entrenadoras
                </Button>
              </div>

              <ol className={styles.steps}>
                {STEPS.map((step) => (
                    <li key={step.title} className={styles.step}>
                <span>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepText}>{step.text}</span>
                </span>
                    </li>
                ))}
              </ol>
            </section>
        )}

        <section aria-labelledby="pricing-faq-title">
          <h2 id="pricing-faq-title" className={styles.sectionTitle}>
            Preguntas frecuentes
          </h2>
          <div className={styles.faq}>
            {FAQS.map((faq) => (
                <details key={faq.question} className={styles.question}>
                  <summary>
                    {faq.question}
                    <span className={styles.toggle}>
                  <Icon name="plus" size={20} />
                </span>
                  </summary>
                  <p className={styles.answer}>{faq.answer}</p>
                </details>
            ))}
          </div>
        </section>
      </div>
  )
}
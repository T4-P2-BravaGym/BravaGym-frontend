import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate, formatEuros } from '@/utils/format'
import styles from './SubscriptionCard.module.scss'

export default function SubscriptionCard({ subscription, pricingTo, paymentsTo }) {
    if (!subscription) {
        return (
            <Card eyebrow="Tu suscripción">
                <EmptyState
                    title="Aún no tienes un plan"
                    text="Elige el plan que mejor te encaje para empezar a reservar clases."
                    action={pricingTo && <Button to={pricingTo}>Ver planes</Button>}
                />
            </Card>
        )
    }

    const { plan } = subscription

    return (
        <Card eyebrow="Tu suscripción" title={plan.name}>
            <div className={styles.badges}>
                <Badge status={subscription.status} />
                {plan.includes_personal_training && <Badge tone="brand">Entrenamiento personal</Badge>}
            </div>
            <p className={styles.price}>
                <span className={styles.amount}>{formatEuros(plan.monthly_price_cents)}</span>
                <span className={styles.period}>/ mes</span>
            </p>
            <p className={styles.since}>Fecha de alta: {formatDate(subscription.start_date)}</p>
            {paymentsTo && (
                <div className={styles.action}>
                    <Button to={paymentsTo} variant="secondary" size="sm">
                        Ver mis pagos
                    </Button>
                </div>
            )}
        </Card>
    )
}
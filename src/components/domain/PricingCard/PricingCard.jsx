import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import cx from '@/utils/cx'
import { formatEuros } from '@/utils/format'
import styles from './PricingCard.module.scss'

const PERSONAL_TRAINING_LINE = 'Sesiones de 1 hora a solas con tu entrenadora'

export default function PricingCard({ plan, features = [], featured = false, current = false, ctaLabel, onSelect, to }) {
    const lines = plan.includes_personal_training ? [PERSONAL_TRAINING_LINE, ...features] : features
    const label = ctaLabel ?? `Elegir ${plan.name}`

    return (
        <article className={cx(styles.root, featured && styles.featured)} onPointerMove={trackPointer}>
            <div className={styles.head}>
                <h3 className={styles.name}>{plan.name}</h3>
                {featured && !current && <Badge tone="solid">La más completa</Badge>}
                {current && <Badge status="active">Tu plan</Badge>}
            </div>
            {plan.description && <p className={styles.description}>{plan.description}</p>}
            <p className={styles.price}>
                <span className={styles.amount}>{formatEuros(plan.monthly_price_cents)}</span>
                <span className={styles.period}>/ mes</span>
            </p>
            {lines.length > 0 && (
                <ul className={styles.features}>
                    {lines.map((line) => (
                        <li key={line}>
              <span className={styles.check}>
                <Icon name="check" size={18} />
              </span>
                            {line}
                        </li>
                    ))}
                </ul>
            )}
            {!current && (
                <div className={styles.action}>
                    <Button
                        variant={featured ? 'primary' : 'secondary'}
                        fullWidth
                        to={to}
                        onClick={onSelect ? () => onSelect(plan) : undefined}
                    >
                        {label}
                    </Button>
                </div>
            )}
        </article>
    )
}

function trackPointer(event) {
    const card = event.currentTarget
    const box = card.getBoundingClientRect()
    card.style.setProperty('--pointer-x', `${event.clientX - box.left}px`)
    card.style.setProperty('--pointer-y', `${event.clientY - box.top}px`)
}
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import cx from '@/utils/cx'
import { formatEuros } from '@/utils/format'
import styles from './PricingCard.module.scss'

/**
 * PricingCard
 * One membership plan on the pricing page. `featured` (one per page) is the dark card
 * with "La más elegida"; `current` marks the member's own plan and hides the button.
 *
 * Props: plan { id, name, description, monthly_price_cents, includes_personal_training },
 *        features (list of short lines), featured, current, ctaLabel, onSelect(plan), to
 */
export default function PricingCard({ plan, features = [], featured = false, current = false, ctaLabel, onSelect, to }) {
  const lines = plan.includes_personal_training ? [...features, 'Sesiones de 1 hora a solas con tu entrenadora'] : features
  const label = ctaLabel ?? `Elegir ${plan.name}`

  return (
    <article className={cx(styles.root, featured && styles.featured)}>
      <div className={styles.head}>
        <h3 className={styles.name}>{plan.name}</h3>
        {featured && !current && <Badge tone="solid">La más elegida</Badge>}
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
        <Button
          variant={featured ? 'primary' : 'secondary'}
          fullWidth
          to={to}
          onClick={onSelect ? () => onSelect(plan) : undefined}
        >
          {label}
        </Button>
      )}
    </article>
  )
}

import { Link } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import styles from './TrainerCard.module.scss'

/**
 * TrainerCard
 * A trainer with avatar, specialty and bio. Contact data (email, phone) is never shown.
 * With `to`, it links to her free personal-training slots.
 *
 * Props: trainer { id, name, specialty, bio }, to, linkLabel
 */
export default function TrainerCard({ trainer, to, linkLabel = 'Ver sus franjas libres' }) {
  return (
    <article className={styles.root}>
      <Avatar name={trainer.name} size="lg" />
      <div className={styles.text}>
        <h3 className={styles.name}>{trainer.name}</h3>
        {trainer.specialty && <span className={styles.specialty}>{trainer.specialty}</span>}
      </div>
      {trainer.bio && <p className={styles.bio}>{trainer.bio}</p>}
      {to && (
        <Link className={styles.link} to={to}>
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  )
}

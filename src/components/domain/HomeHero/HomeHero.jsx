import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { PATHS } from '@/routes/paths'
import { formatDate, formatTime } from '@/utils/format'
import heroImage from '@/assets/images/hero_card_trainning.jpg'
import styles from './HomeHero.module.scss'

export default function HomeHero({ nextSession = null }) {
    return (
        <section className={styles.root} aria-labelledby="home-hero-title">
            <div className={styles.copy}>
                <p className={styles.tag}>Solo mujeres · Barcelona</p>

                <h1 id="home-hero-title" className={styles.title}>
                    Fuerza a tu ritmo, <span className={styles.accent}>sin miradas.</span>
                </h1>

                <p className={styles.subtitle}>
                    Entrenamiento de fuerza <mark className={styles.highlight}>especializado para mujeres</mark>.
                </p>

                <p className={styles.intro}>
                    Entrenadoras especializadas, grupos pequeños y técnica antes que kilos. Reserva, sigue tu
                    rutina y paga desde la app. Empieces de cero o lleves años levantando.
                </p>

                <div className={styles.actions}>
                    <Button to={PATHS.pricing}>Ver planes</Button>
                    <Button to={PATHS.schedule} variant="secondary">
                        Horario de clases
                    </Button>
                </div>
            </div>

            <div className={styles.media}>
                <div className={styles.photoFrame}>
                    <img className={styles.photo} src={heroImage} alt="Socias entrenando en la sala" />
                </div>
                {nextSession && <NextSessionCard session={nextSession} />}
            </div>
        </section>
    )
}

function NextSessionCard({ session }) {
    return (
        <div className={styles.nextCard}>
            <span className={styles.eyebrow}>Próxima clase</span>
            <span className={styles.nextName}>{session.class_type_name}</span>
            <span className={styles.nextMeta}>
        <time dateTime={session.starts_at}>
          {formatDate(session.starts_at)} · {formatTime(session.starts_at)}
        </time>
                {session.trainer_name && ` · con ${session.trainer_name}`}
      </span>
            <Badge tone="success" className={styles.nextBadge}>
                {spotsLabel(session.free_spots)}
            </Badge>
        </div>
    )
}

function spotsLabel(freeSpots) {
    return freeSpots === 1 ? '1 plaza libre' : `${freeSpots} plazas libres`
}
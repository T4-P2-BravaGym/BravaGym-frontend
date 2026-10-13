import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PATHS } from '@/routes/paths'
import { formatDate, formatTime } from '@/utils/format'
import heroImage from '@/assets/images/hero_card_trainning.jpg'
import styles from './HomeHero.module.scss'

export default function HomeHero({ nextSession = null }) {
    return (
        <section className={styles.root}>
            <div className={styles.copy}>
               <span className={styles.tag}>Gimnasio de fuerza para mujeres · Barcelona </span>
                <h1 id="home-hero-title" className={styles.title}>
                    Fuerza a tu ritmo, <span className={styles.accent}>sin miradas.</span>
                </h1>

                <p className={styles.intro}>
                    Clases en grupos pequeños, entrenamiento personal y una app para reservar, seguir tu rutina y gestionar tus pagos. Empieces de cero o lleves años levantando.
                </p>

                <div className={styles.actions}>
                    <Button to={PATHS.pricing}>Ver Planes</Button>
                    <Button to={PATHS.schedule} variant="secondary">
                        Horario de clases
                    </Button>
                </div>
            </div>

            <div className={styles.media}>
                <img className={styles.photo} src={heroImage} alt="Socias entrenando en la sala" />
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
                </time>{' '}
                · con {session.trainer_name}
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
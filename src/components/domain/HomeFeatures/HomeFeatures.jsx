import Icon from '@/components/ui/Icon'
import useInView from '@/hooks/useInView'
import cx from '@/utils/cx'
import styles from './HomeFeatures.module.scss'

const FEATURES = [
    {
        icon: 'dumbbell',
        title: 'Fuerza de verdad',
        text: 'Sentadilla, peso muerto, press… Aprendes la técnica de los básicos y subes carga a tu ritmo.',
    },
    {
        icon: 'user',
        title: 'Entrenadoras especializadas',
        text: 'Mujeres que entrenan a mujeres y adaptan cada ejercicio a tu nivel y a tu momento.',
    },
    {
        icon: 'users',
        title: 'Grupos pequeños',
        text: 'Aforo limitado en cada clase, para que la entrenadora corrija tu técnica.',
    },
    {
        icon: 'calendar',
        title: 'Todo desde la app',
        text: 'Reserva, entra en lista de espera, cancela hasta 1 hora antes y consulta tu rutina.',
    },
]

export default function HomeFeatures() {
    const [ref, inView] = useInView()

    return (
        <section ref={ref} className={cx(styles.root, inView && styles.visible)} aria-labelledby="home-features-title">
            <div className={styles.header}>
                <span className={styles.eyebrow}>Por qué Brava</span>
                <h2 id="home-features-title" className={styles.heading}>
                    Un gimnasio de fuerza pensado para mujeres
                </h2>
                <p className={styles.lead}>
                    Aquí nadie te mira raro en la zona de pesas. Entrenas con mujeres, con un plan y con alguien
                    que te enseña a hacerlo bien.
                </p>
            </div>

            <ul className={styles.list}>
                {FEATURES.map((feature, index) => (
                    <li key={feature.title} className={styles.item} style={{ '--index': index }}>
            <span className={styles.icon}>
              <Icon name={feature.icon} size={24} />
            </span>
                        <h3 className={styles.title}>{feature.title}</h3>
                        <p className={styles.text}>{feature.text}</p>
                    </li>
                ))}
            </ul>
        </section>
    )
}